import dayjs from 'dayjs'
import * as React from 'react'
import { Platform, Text, TouchableOpacity } from 'react-native'

import { CalendarTouchableOpacityProps, ICalendarEvent } from '../interfaces'
import { useTheme } from '../theme/ThemeContext'
// import { formatStartEnd } from '../utils'
import { Draggable } from './CalendarDraggable'

interface DefaultCalendarEventRendererProps<T> {
  touchableOpacityProps: CalendarTouchableOpacityProps
  event: ICalendarEvent<T>
  showTime?: boolean
  textColor: string
  ampm: boolean
  moveCallBack: any
  events: ICalendarEvent<T>[]
  dateRange: dayjs.Dayjs[]
}

export function DefaultCalendarEventRenderer<T>({
  touchableOpacityProps,
  event,
  showTime = false,
  textColor,
  // ampm,
  moveCallBack,
  events,
  dateRange,
}: DefaultCalendarEventRendererProps<T>) {
  const theme = useTheme()
  // const eventTimeStyle = { fontSize: theme.typography.xs.fontSize, color: textColor }
  const eventTitleStyle = {
    fontSize: theme.typography.sm.fontSize,
    color: textColor,
    fontFamily: Platform.OS == 'ios' ? 'Didot' : 'monospace',
  }

  return (
    <Draggable
      touchableOpacityProps={touchableOpacityProps}
      moveCallBack={moveCallBack}
      event={event}
      events={events}
      dateRange={dateRange}
    >
      <TouchableOpacity
        onPress={touchableOpacityProps.onPress}
        style={{ width: '100%', height: '100%' }}
      >
        {dayjs(event.end).diff(event.start, 'minute') < 32 && showTime ? (
          <Text style={eventTitleStyle}>
            {event.title}
            {/* <Text style={eventTimeStyle}>
              {dayjs(event.start).format(ampm ? 'hh:mm a' : 'HH:mm')}
            </Text> */}
          </Text>
        ) : (
          <>
            <Text style={eventTitleStyle}>{event.title}</Text>
            {/* {showTime && (
              <Text style={eventTimeStyle}>
                {formatStartEnd(event.start, event.end, ampm ? 'h:mm a' : 'HH:mm')}
              </Text>
            )} */}
            {event.children && event.children}
          </>
        )}
      </TouchableOpacity>
    </Draggable>
    // <Draggable />
  )
}
