import dayjs from 'dayjs'
import * as React from 'react'

import { OVERLAP_OFFSET, u } from '../commonStyles'
import { useCalendarTouchableOpacityProps } from '../hooks/useCalendarTouchableOpacityProps'
import { EventCellStyle, EventRenderer, ICalendarEvent } from '../interfaces'
import { useTheme } from '../theme/ThemeContext'
import { DAY_MINUTES, getRelativeTopInDay, getStyleForOverlappingEvent, typedMemo } from '../utils'
import { DefaultCalendarEventRenderer } from './DefaultCalendarEventRenderer'

const getEventCellPositionStyle = (start: Date, end: Date) => {
  const relativeHeight = 100 * (1 / DAY_MINUTES) * dayjs(end).diff(start, 'minute')
  const relativeTop = getRelativeTopInDay(dayjs(start))
  return {
    height: `${relativeHeight}%`,
    top: `${relativeTop}%`,
    marginLeft: 200,
  }
}

interface CalendarEventProps<T> {
  event: ICalendarEvent<T>
  onPressEvent?: (event: ICalendarEvent<T>) => void
  eventCellStyle?: EventCellStyle<T>
  showTime: boolean
  eventCount?: number
  eventOrder?: number
  overlapOffset?: number
  renderEvent?: EventRenderer<T>
  ampm: boolean
  moveCallBack: any
  events: ICalendarEvent<T>[]
  dateRange: dayjs.Dayjs[]
}

function _CalendarEvent<T>({
  event,
  onPressEvent,
  eventCellStyle,
  showTime,
  eventCount = 1,
  eventOrder = 0,
  overlapOffset = OVERLAP_OFFSET,
  renderEvent,
  ampm,
  moveCallBack,
  events,
  dateRange,
}: CalendarEventProps<T>) {
  const theme = useTheme()

  const palettes = React.useMemo(
    () => [theme.palette.primary, ...theme.eventCellOverlappings],
    [theme],
  )

  const touchableOpacityProps = useCalendarTouchableOpacityProps({
    event,
    eventCellStyle,
    onPressEvent,
    injectedStyles: [
      getEventCellPositionStyle(event.start, event.end),
      getStyleForOverlappingEvent(eventOrder, overlapOffset),
      u['absolute'],
      u['mt-2'],
      u['mx-3'],
    ],
  })

  const textColor = React.useMemo(() => {
    const fgColors = palettes.map((p) => p.contrastText)
    return fgColors[eventCount % fgColors.length] || fgColors[0]
  }, [eventCount, palettes])

  if (renderEvent) {
    return renderEvent(event, touchableOpacityProps)
  }

  return (
    <DefaultCalendarEventRenderer
      event={event}
      showTime={showTime}
      ampm={ampm}
      touchableOpacityProps={touchableOpacityProps}
      textColor={textColor}
      moveCallBack={moveCallBack}
      events={events}
      dateRange={dateRange}
    />
  )
}

export const CalendarEvent = typedMemo(_CalendarEvent)
