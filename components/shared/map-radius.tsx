'use client'

import React, { useEffect, useRef } from 'react'
import L from 'leaflet'
import 'leaflet/dist/leaflet.css'
import { Loader2 } from 'lucide-react'

// Fix for default marker icon in Leaflet + Next.js
// We define it outside to avoid recreating it on every render
const createDefaultIcon = () => L.icon({
  iconUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png',
  shadowUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png',
  iconSize: [25, 41],
  iconAnchor: [12, 41],
})

interface MapRadiusProps {
  center: [number, number]
  radius: number // in km
}

export default function MapRadius({ center, radius }: MapRadiusProps) {
  const containerRef = useRef<HTMLDivElement>(null)
  const mapRef = useRef<L.Map | null>(null)
  const markerRef = useRef<L.Marker | null>(null)
  const circleRef = useRef<L.Circle | null>(null)
  const [isLoaded, setIsLoaded] = React.useState(false)

  // Initialize Map
  useEffect(() => {
    if (!containerRef.current) return

    // CRITICAL: Clean up any existing map instance on this element before initializing
    // This is the "nuclear" fix for "Map container is already initialized"
    const container = containerRef.current
    if ((container as any)._leaflet_id) {
      // If Leaflet thinks this container is initialized, we force-clear it
      container.innerHTML = ''
      delete (container as any)._leaflet_id
    }

    try {
      const map = L.map(container, {
        center: center,
        zoom: 13,
        scrollWheelZoom: false,
        zoomControl: true,
      })

      L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
        attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
      }).addTo(map)

      const marker = L.marker(center, { icon: createDefaultIcon() }).addTo(map)
      const circle = L.circle(center, {
        radius: radius * 1000,
        fillColor: '#3b82f6', // Primary Blue
        color: '#3b82f6',
        fillOpacity: 0.15,
        weight: 2,
        dashArray: '5, 10'
      }).addTo(map)

      // Initial fit bounds
      map.fitBounds(circle.getBounds(), { padding: [40, 40] })

      mapRef.current = map
      markerRef.current = marker
      circleRef.current = circle
      setIsLoaded(true)
    } catch (err) {
      console.error("Leaflet initialization error:", err)
    }

    return () => {
      if (mapRef.current) {
        mapRef.current.remove()
        mapRef.current = null
      }
    }
  }, []) // Run once on mount

  // Update center and radius without re-initializing the whole map
  useEffect(() => {
    if (mapRef.current && markerRef.current && circleRef.current) {
      markerRef.current.setLatLng(center)
      circleRef.current.setLatLng(center)
      circleRef.current.setRadius(radius * 1000)
      
      // Dynamically adjust zoom to fit the circle
      mapRef.current.fitBounds(circleRef.current.getBounds(), { padding: [40, 40] })
    }
  }, [center, radius])

  return (
    <div className="w-full h-full relative bg-muted/20">
      {!isLoaded && (
        <div className="absolute inset-0 flex items-center justify-center z-10 bg-muted/10">
          <Loader2 className="h-8 w-8 animate-spin opacity-20" />
        </div>
      )}
      <div 
        ref={containerRef} 
        className="w-full h-full" 
        style={{ zIndex: 1 }}
      />
    </div>
  )
}
