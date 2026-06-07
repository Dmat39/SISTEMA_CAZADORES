"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { ChevronLeft, ChevronRight, CalendarDays } from "lucide-react"
import { cn } from "@/lib/utils"

export function CalendarPicker({ startDate, endDate, onDateRangeChange, className }) {
  const [isOpen, setIsOpen] = useState(false)
  const [currentMonth, setCurrentMonth] = useState(new Date())
  const [tempStartDate, setTempStartDate] = useState(startDate)
  const [tempEndDate, setTempEndDate] = useState(endDate)
  const [selectingStart, setSelectingStart] = useState(true)

  const formatDateRange = () => {
    const start = startDate.toLocaleDateString("es-ES", {
      month: "short",
      day: "numeric",
    })
    const end = endDate.toLocaleDateString("es-ES", {
      month: "short",
      day: "numeric",
    })
    return `${start} - ${end}`
  }

  const getDaysInMonth = (date) => {
    const year = date.getFullYear()
    const month = date.getMonth()
    const firstDay = new Date(year, month, 1)
    const lastDay = new Date(year, month + 1, 0)
    const daysInMonth = lastDay.getDate()
    const startingDayOfWeek = firstDay.getDay()

    const days = []

    // Add empty cells for days before the first day of the month
    for (let i = 0; i < startingDayOfWeek; i++) {
      days.push(null)
    }

    // Add all days of the month
    for (let day = 1; day <= daysInMonth; day++) {
      days.push(new Date(year, month, day))
    }

    return days
  }

  const isDateInRange = (date) => {
    if (!tempStartDate || !tempEndDate) return false
    return date >= tempStartDate && date <= tempEndDate
  }

  const isDateSelected = (date) => {
    if (!tempStartDate && !tempEndDate) return false
    return (
      (tempStartDate && date.getTime() === tempStartDate.getTime()) ||
      (tempEndDate && date.getTime() === tempEndDate.getTime())
    )
  }

  const handleDateClick = (date) => {
    if (selectingStart) {
      setTempStartDate(date)
      setTempEndDate(null)
      setSelectingStart(false)
    } else {
      if (tempStartDate && date < tempStartDate) {
        setTempStartDate(date)
        setTempEndDate(tempStartDate)
      } else {
        setTempEndDate(date)
      }
      setSelectingStart(true)
    }
  }

  const handleApply = () => {
    if (tempStartDate && tempEndDate) {
      onDateRangeChange(tempStartDate, tempEndDate)
    }
    setIsOpen(false)
  }

  const handleCancel = () => {
    setTempStartDate(startDate)
    setTempEndDate(endDate)
    setIsOpen(false)
    setSelectingStart(true)
  }

  const navigateMonth = (direction) => {
    setCurrentMonth((prev) => {
      const newDate = new Date(prev)
      if (direction === "prev") {
        newDate.setMonth(prev.getMonth() - 1)
      } else {
        newDate.setMonth(prev.getMonth() + 1)
      }
      return newDate
    })
  }

  const days = getDaysInMonth(currentMonth)
  const monthYear = currentMonth.toLocaleDateString("es-ES", {
    month: "long",
    year: "numeric",
  })

  return (
    <div className={cn("relative", className)}>
      <Button
        variant="outline"
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center space-x-2 min-w-[160px] justify-start"
      >
        <CalendarDays className="h-4 w-4" />
        <span>{formatDateRange()}</span>
        <ChevronRight className={cn("h-4 w-4 transition-transform", isOpen && "rotate-90")} />
      </Button>

      {isOpen && (
        <Card className="absolute top-full left-0 mt-2 z-50 w-80">
          <CardContent className="p-4">
            {/* Month Navigation */}
            <div className="flex items-center justify-between mb-4">
              <Button variant="ghost" size="sm" onClick={() => navigateMonth("prev")}>
                <ChevronLeft className="h-4 w-4" />
              </Button>
              <h3 className="font-medium capitalize">{monthYear}</h3>
              <Button variant="ghost" size="sm" onClick={() => navigateMonth("next")}>
                <ChevronRight className="h-4 w-4" />
              </Button>
            </div>

            {/* Days of Week */}
            <div className="grid grid-cols-7 gap-1 mb-2">
              {["Do", "Lu", "Ma", "Mi", "Ju", "Vi", "Sa"].map((day) => (
                <div key={day} className="text-center text-sm font-medium text-gray-600 dark:text-gray-400 p-2">
                  {day}
                </div>
              ))}
            </div>

            {/* Calendar Grid */}
            <div className="grid grid-cols-7 gap-1 mb-4">
              {days.map((date, index) => (
                <div key={index} className="aspect-square">
                  {date && (
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => handleDateClick(date)}
                      className={cn(
                        "w-full h-full p-0 text-sm",
                        isDateSelected(date) && "bg-blue-600 text-white hover:bg-blue-700",
                        isDateInRange(date) && !isDateSelected(date) && "bg-blue-100 hover:bg-blue-200",
                        date.toDateString() === new Date().toDateString() && "font-bold",
                      )}
                    >
                      {date.getDate()}
                    </Button>
                  )}
                </div>
              ))}
            </div>

            {/* Action Buttons */}
            <div className="flex justify-end space-x-2">
              <Button variant="outline" size="sm" onClick={handleCancel}>
                Cancelar
              </Button>
              <Button size="sm" onClick={handleApply} disabled={!tempStartDate || !tempEndDate}>
                Aplicar
              </Button>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  )
}