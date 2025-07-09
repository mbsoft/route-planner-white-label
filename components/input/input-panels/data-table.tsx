'use client'

import {useState, useEffect, useRef, useCallback} from 'react'

interface DataTableProps {
  header: string[]
  data: string[][]
  title: string
}

export const DataTable = ({header, data, title}: DataTableProps) => {
  const [visibleRows, setVisibleRows] = useState(10)
  const [isLoading, setIsLoading] = useState(false)
  const observerRef = useRef<IntersectionObserver | null>(null)
  const loadingRef = useRef<HTMLDivElement>(null)

  const currentData = data.slice(0, visibleRows)
  const hasMoreData = visibleRows < data.length

  // Reset visible rows when data changes
  useEffect(() => {
    setVisibleRows(10)
  }, [data.length])



  const loadMoreData = useCallback(() => {
    if (isLoading || !hasMoreData) return
    
    setIsLoading(true)
    // Simulate loading delay for better UX
    setTimeout(() => {
      setVisibleRows(prev => Math.min(prev + 10, data.length))
      setIsLoading(false)
    }, 300)
  }, [isLoading, hasMoreData, data.length])

  // Set up intersection observer for infinite scroll
  useEffect(() => {
    if (!loadingRef.current) return

    observerRef.current = new IntersectionObserver(
      (entries) => {
        if (entries[0].isIntersecting && hasMoreData && !isLoading) {
          loadMoreData()
        }
      },
      { threshold: 0.1 }
    )

    observerRef.current.observe(loadingRef.current)

    return () => {
      if (observerRef.current) {
        observerRef.current.disconnect()
      }
    }
  }, [loadMoreData, hasMoreData, isLoading])

  if (data.length === 0) {
    return (
      <div style={{
        padding: '20px',
        textAlign: 'center',
        color: '#666'
      }}>
        No data imported yet
      </div>
    )
  }

  return (
    <>
      <style>{`
        @keyframes rotate {
          from { transform: rotate(0deg); }
          to { transform: rotate(360deg); }
        }
      `}</style>
      <div style={{
        border: '1px solid #e0e0e0',
        borderRadius: '8px',
        overflow: 'hidden'
      }}>
        <div style={{
          padding: '15px 20px',
          backgroundColor: '#f5f5f5',
          borderBottom: '1px solid #e0e0e0',
          fontWeight: 'bold'
        }}>
          {title} ({currentData.length} of {data.length} rows)
        </div>
        
        <div style={{
          overflowX: 'auto',
          maxHeight: '400px',
          overflowY: 'auto'
        }}>
          <table style={{
            width: '100%',
            borderCollapse: 'collapse'
          }}>
            <thead>
              <tr style={{
                backgroundColor: '#f9f9f9'
              }}>
                {header.map((col, index) => (
                  <th key={index} style={{
                    padding: '12px 8px',
                    textAlign: 'left',
                    borderBottom: '1px solid #e0e0e0',
                    fontSize: '14px',
                    fontWeight: 'bold'
                  }}>
                    {col}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {currentData.map((row, rowIndex) => (
                <tr key={rowIndex} style={{
                  borderBottom: '1px solid #f0f0f0'
                }}>
                  {row.map((cell, cellIndex) => (
                    <td key={cellIndex} style={{
                      padding: '8px',
                      fontSize: '13px',
                      maxWidth: '200px',
                      overflow: 'hidden',
                      textOverflow: 'ellipsis',
                      whiteSpace: 'nowrap'
                    }}>
                      {cell}
                    </td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        
        {/* Loading indicator for infinite scroll */}
        {hasMoreData && (
          <div
            ref={loadingRef}
            style={{
              padding: '15px 20px',
              textAlign: 'center',
              borderTop: '1px solid #e0e0e0',
              backgroundColor: '#f9f9f9'
            }}
          >
            {isLoading ? (
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px' }}>
                <div style={{
                  width: '16px',
                  height: '16px',
                  border: '2px solid #f3f3f3',
                  borderTop: '2px solid #1976d2',
                  borderRadius: '50%',
                  animation: 'rotate 1s linear infinite'
                }} />
                <span style={{ fontSize: '14px', color: '#666' }}>Loading more data...</span>
              </div>
            ) : (
              <div style={{ fontSize: '14px', color: '#666' }}>
                Scroll down to load more data
              </div>
            )}
          </div>
        )}
      </div>
    </>
  )
} 