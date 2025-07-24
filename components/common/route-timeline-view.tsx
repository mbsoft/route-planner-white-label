'use client'

import React, { useMemo, useRef, useState, useEffect } from 'react'
import * as d3 from 'd3'
import { Box, Typography, Paper } from '@mui/material'
import { styled } from '@mui/material/styles'
import dayjs from 'dayjs'
import DirectionsCarIcon from '@mui/icons-material/DirectionsCar';
import LocalGasStationIcon from '@mui/icons-material/LocalGasStation';
import DownloadIcon from '@mui/icons-material/Download';
import UploadIcon from '@mui/icons-material/Upload';
import FlagIcon from '@mui/icons-material/Flag';
import LocalShippingIcon from '@mui/icons-material/LocalShipping';
import { useWhiteLabelContext } from '../../app/white-label-layout'

// Types for timeline data
interface TimelineStep {
  taskId: string
  type: string
  description: string
  location: [number, number] | null
  arrival: number
  departure: number
  service: number
  load: number[]
}

interface TimelineRoute {
  vehicle: string
  color: string
  steps: TimelineStep[]
  start: Date
  end: Date
}

interface RouteTimelineViewProps {
  routes: any[]
  width?: number
  height?: number
}

// Convert Unix timestamp to Date
const unixToDate = (timestamp: number) => new Date(timestamp * 1000)

// Format time for display
const formatTime = (timestamp: number) => {
  return new Date(timestamp * 1000).toLocaleTimeString('en-GB', {
    hour: '2-digit',
    minute: '2-digit',
    hour12: false
  })
}

// Get step type icon
const getStepTypeIcon = (type: string) => {
  const { companyColor } = useWhiteLabelContext();
  const iconStyle = {
    width: '20px',
    height: '20px',
    color: companyColor,
  };
  switch (type) {
    case 'start':
      return <LocalShippingIcon sx={iconStyle} />;
    case 'job':
      return <LocalGasStationIcon sx={iconStyle} />;
    case 'pickup':
      return <DownloadIcon sx={iconStyle} />;
    case 'delivery':
      return <UploadIcon sx={iconStyle} />;
    case 'end':
      return <FlagIcon sx={iconStyle} />;
    default:
      return <LocalShippingIcon sx={iconStyle} />;
  }
};

export const RouteTimelineView: React.FC<RouteTimelineViewProps> = ({ 
  routes, 
  height = 400 
}) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const [containerWidth, setContainerWidth] = useState(1200);
  const svgRef = useRef<SVGSVGElement | null>(null)
  const [hoveredStep, setHoveredStep] = useState<TimelineStep | null>(null)
  const [zoomTransform, setZoomTransform] = useState<d3.ZoomTransform>(d3.zoomIdentity)

  // Responsive width
  useEffect(() => {
    if (!containerRef.current) return;
    const handleResize = () => {
      setContainerWidth(containerRef.current!.offsetWidth);
    };
    handleResize();
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  // Transform routes data for timeline
  const timelineData: TimelineRoute[] = useMemo(() => {
    const data = routes.map((route, index) => {
      const color = `hsl(${(index * 137.5) % 360}, 70%, 50%)`
      
      const steps: TimelineStep[] = route.steps?.map((step: any) => ({
        taskId: step.id || step.taskId || `step-${Math.random()}`,
        type: step.type || 'job',
        description: step.description || 'No description',
        location: step.location || null,
        arrival: step.arrival || 0,
        departure: step.departure || step.arrival || 0,
        service: step.service || 0,
        load: step.load || []
      })) || []

      const minTime = d3.min(steps, d => d.arrival) || 0
      const maxTime = d3.max(steps, d => d.departure) || 0

      return {
        vehicle: route.vehicle || `Vehicle ${index + 1}`,
        color,
        steps,
        start: unixToDate(minTime),
        end: unixToDate(maxTime)
      }
    })
    return data
  }, [routes])

  // Calculate time range for all routes
  const timeRange = useMemo(() => {
    if (timelineData.length === 0) return [new Date(), new Date()]
    
    const allTimes = timelineData.flatMap(route => 
      route.steps.flatMap((step: TimelineStep) => [step.arrival, step.departure])
    ).filter((time: number) => time > 0)
    
    const minTime = d3.min(allTimes) || 0
    const maxTime = d3.max(allTimes) || 0
    
    // Use 1% padding for a tighter fit
    const padding = (maxTime - minTime) * 0.01
    const range = [unixToDate(minTime - padding), unixToDate(maxTime + padding)]
    return range
  }, [timelineData])

  // D3 scales
  const xScale = useMemo(() => {
    const baseScale = d3.scaleTime()
      .domain(timeRange)
      .range([40, containerWidth - 20]); // Use nearly the full width, with small margins
    
    // Apply zoom transform
    return zoomTransform.rescaleX(baseScale)
  }, [timeRange, containerWidth, zoomTransform])

  const yScale = useMemo(() => {
    return d3.scaleBand()
      .domain(timelineData.map(route => route.vehicle))
      .range([40, height - 40])
      .padding(0.3)
  }, [timelineData, height])

  // Time axis
  const timeAxis = useMemo(() => {
    return d3.axisBottom(xScale)
      .tickFormat((d: Date | d3.NumberValue) => {
        if (d instanceof Date) {
          return d3.timeFormat('%H:%M')(d)
        }
        return ''
      })
      .ticks(d3.timeHour.every(1))
  }, [xScale])

  // Zoom behavior
  const zoomBehavior = useMemo(() => {
    return d3.zoom<SVGSVGElement, unknown>()
      .scaleExtent([0.5, 10]) // Min and max zoom levels
      .translateExtent([[60, 0], [containerWidth - 40, height]]) // Constrain panning
      .on('zoom', (event) => {
        setZoomTransform(event.transform)
      })
  }, [containerWidth, height])

  // Render timeline
  React.useEffect(() => {
    if (!svgRef.current || timelineData.length === 0) return

    const svg = d3.select(svgRef.current)
    svg.selectAll('*').remove()

    // Apply zoom behavior
    svg.call(zoomBehavior as any)

    // Add time axis
    svg.append('g')
      .attr('transform', `translate(0, ${height - 40})`)
      .call(timeAxis as any)

    // Add axis label
    svg.append('text')
      .attr('x', containerWidth / 2)
      .attr('y', height - 10)
      .attr('text-anchor', 'middle')
      .style('font-size', '15px') // Increased from 12px
      .style('fill', '#666')
      .text('Time')

    // Add vehicle labels
    svg.append('g')
      .selectAll('text')
      .data(timelineData)
      .enter()
      .append('text')
      .attr('x', 10)
      .attr('y', d => (yScale(d.vehicle) || 0) + (yScale.bandwidth() || 0) / 2)
      .attr('dy', '0.35em')
      .style('font-size', '15px') // Increased from 12px
      .style('font-weight', 'bold')
      .style('fill', '#333')
      .text(d => d.vehicle)

    // Add route lines
    timelineData.forEach(route => {
      const routeGroup = svg.append('g')
        .attr('class', 'route-group')

      // Draw drive and service segments
      route.steps.forEach((step, index) => {
        const y = (yScale(route.vehicle) || 0) + (yScale.bandwidth() || 0) / 2
        // Drive segment: from previous step's departure to this step's arrival
        if (index > 0) {
          const prevStep = route.steps[index - 1]
          const driveStart = xScale(unixToDate(prevStep.departure))
          const driveEnd = xScale(unixToDate(step.arrival))
          if (driveEnd > driveStart) {
            routeGroup.append('rect')
              .attr('x', driveStart)
              .attr('y', y - 2.5) // Adjusted to match blue segment positioning
              .attr('width', driveEnd - driveStart)
              .attr('height', 5) // Increased to match blue segment height
              .attr('fill', '#43a047') // green
              .attr('opacity', 0.7)
          }
        }
        // Service segment: from this step's arrival to departure
        const serviceStart = xScale(unixToDate(step.arrival))
        const serviceEnd = xScale(unixToDate(step.departure))
        if (serviceEnd > serviceStart) {
          routeGroup.append('rect')
            .attr('x', serviceStart)
            .attr('y', y - 2.5) // Adjusted for new height
            .attr('width', serviceEnd - serviceStart)
            .attr('height', 5) // Increased from 4px to 5px (25% larger)
            .attr('fill', '#1976d2') // blue
            .attr('opacity', 0.9) // Increased opacity
        } else if (step.service > 0) {
          // If service time exists but departure equals arrival, create a small visible segment
          const serviceWidth = Math.max(2, xScale(unixToDate(step.arrival + step.service)) - serviceStart)
          routeGroup.append('rect')
            .attr('x', serviceStart)
            .attr('y', y - 2.5) // Adjusted for new height
            .attr('width', serviceWidth)
            .attr('height', 5) // Increased from 4px to 5px (25% larger)
            .attr('fill', '#1976d2') // blue
            .attr('opacity', 0.9)
        }
      })

      // Remove the continuous route line - only show colored segments
      // const lineData = route.steps.map(step => ({
      //   x: xScale(unixToDate(step.arrival)),
      //   y: (yScale(route.vehicle) || 0) + (yScale.bandwidth() || 0) / 2
      // }))

      // routeGroup.append('path')
      //   .datum(lineData)
      //   .attr('fill', 'none')
      //   .attr('stroke', route.color)
      //   .attr('stroke-width', 2)
      //   .attr('d', d3.line<{x: number, y: number}>()
      //     .x(d => d.x)
      //     .y(d => d.y) as any
      //   )

      // Add step markers
      route.steps.forEach((step, index) => {
        const x = xScale(unixToDate(step.arrival))
        const y = (yScale(route.vehicle) || 0) + (yScale.bandwidth() || 0) / 2
        
        // Offset start and end icons by moving them up 10px
        const yOffset = (step.type === 'start' || step.type === 'end') ? -10 : 0

        const stepGroup = routeGroup.append('g')
          .attr('class', 'step-group')
          .attr('transform', `translate(${x}, ${y + yOffset})`)

        // Step circle
        stepGroup.append('circle')
          .attr('r', 7.5) // Increased from 6
          .attr('fill', route.color)
          .attr('stroke', '#fff')
          .attr('stroke-width', 2)
          .style('cursor', 'pointer')
          .on('mouseenter', () => setHoveredStep(step))
          .on('mouseleave', () => setHoveredStep(null))

        // Step label
        stepGroup.append('text')
          .attr('x', 0)
          .attr('y', -15)
          .attr('text-anchor', 'middle')
          .style('font-size', '12.5px') // Increased from 10px
          .style('fill', '#666')
          .style('pointer-events', 'none')
          .text(formatTime(step.arrival))
      })
    })
  }, [timelineData, xScale, yScale, timeAxis, height, zoomBehavior])

  if (timelineData.length === 0) {
    return (
      <Paper sx={{ p: 3, textAlign: 'center' }}>
        <Typography variant="body1" color="text.secondary" sx={{ fontSize: '13px' }}>
          No route data available for timeline view
        </Typography>
      </Paper>
    )
  }

  return (
    <Box ref={containerRef} sx={{ position: 'relative', width: '100%' }}>
      <Paper sx={{ p: 2, overflow: 'auto', width: '100%' }}>
        <svg
          ref={svgRef}
          width={containerWidth}
          height={height}
          style={{ display: 'block', margin: '0 auto', width: '100%' }}
        />
        {/* Overlay icons */}
        {timelineData.map(route =>
          route.steps.map((step, index) => {
            const x = xScale(unixToDate(step.arrival));
            const y = (yScale(route.vehicle) || 0) + (yScale.bandwidth() || 0) / 2;
            // Remove yOffset for perfect alignment
            return (
              <Box
                key={route.vehicle + '-' + step.taskId + '-' + index}
                sx={{
                  position: 'absolute',
                  left: x - 10,
                  top: y - 10,
                  pointerEvents: 'none',
                  zIndex: 2,
                }}
              >
                {getStepTypeIcon(step.type)}
              </Box>
            );
          })
        )}
      </Paper>
      {/* Tooltip */}
      {hoveredStep && (
        <Paper
          sx={{
            position: 'absolute',
            p: 2,
            backgroundColor: 'rgba(255, 255, 255, 0.95)',
            border: '1px solid #ddd',
            borderRadius: 1,
            boxShadow: 2,
            zIndex: 1000,
            maxWidth: 300,
          }}
        >
          <Typography variant="subtitle2" sx={{ fontWeight: 'bold', mb: 1 }}>
            {hoveredStep.type.toUpperCase()}
          </Typography>
          <Typography variant="body2" sx={{ mb: 1 }}>
            {hoveredStep.description}
          </Typography>
          <Typography variant="caption" sx={{ display: 'block', color: '#666' }}>
            Arrival: {formatTime(hoveredStep.arrival)}
          </Typography>
          <Typography variant="caption" sx={{ display: 'block', color: '#666' }}>
            Departure: {formatTime(hoveredStep.departure)}
          </Typography>
          {hoveredStep.service > 0 && (
            <Typography variant="caption" sx={{ display: 'block', color: '#666' }}>
              Service: {Math.round(hoveredStep.service / 60)} min
            </Typography>
          )}
          {hoveredStep.load && hoveredStep.load.length > 0 && (
            <Typography variant="caption" sx={{ display: 'block', color: '#666' }}>
              Load: {hoveredStep.load.join(', ')} gal
            </Typography>
          )}
        </Paper>
      )}
    </Box>
  )
} 