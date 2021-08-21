import dayjs, { Dayjs } from 'dayjs'
import * as React from 'react'
import { Platform, ScrollView, StyleSheet, View, ViewStyle } from 'react-native'

import { u } from '../commonStyles'
import { useNow } from '../hooks/useNow'
import { usePanResponder } from '../hooks/usePanResponder'
import { EventCellStyle, EventRenderer, HorizontalDirection, ICalendarEvent } from '../interfaces'
import { useTheme } from '../theme/ThemeContext'
import {
  getCountOfEventsAtEvent,
  getOrderOfEvent,
  getRelativeTopInDay,
  hours,
  isToday,
  typedMemo,
} from '../utils'
import { CalendarEvent } from './CalendarEvent'
import { HourGuideCell } from './HourGuideCell'
import { HourGuideColumn } from './HourGuideColumn'

const styles = StyleSheet.create({
  nowIndicator: {
    position: 'absolute',
    zIndex: 10000,
    height: 2,
    width: '100%',
  },
})

interface CalendarBodyProps<T> {
  cellHeight: number
  containerHeight: number
  dateRange: dayjs.Dayjs[]
  events: ICalendarEvent<T>[]
  scrollOffsetMinutes: number
  ampm: boolean
  showTime: boolean
  style: ViewStyle
  eventCellStyle?: EventCellStyle<T>
  hideNowIndicator?: boolean
  overlapOffset?: number
  onPressCell?: (date: Date) => void
  onPressEvent?: (event: ICalendarEvent<T>) => void
  onSwipeHorizontal?: (d: HorizontalDirection) => void
  renderEvent?: EventRenderer<T>
  moveCallBack: any
}

function _CalendarBody<T>({
  containerHeight,
  cellHeight,
  dateRange,
  style,
  onPressCell,
  events,
  onPressEvent,
  eventCellStyle,
  ampm,
  showTime,
  scrollOffsetMinutes,
  onSwipeHorizontal,
  hideNowIndicator,
  overlapOffset,
  renderEvent,
  moveCallBack,
}: CalendarBodyProps<T>) {
  const scrollView = React.useRef<ScrollView>(null)
  const { now } = useNow(!hideNowIndicator)
  const layoutProps = React.useRef({})
  var daysWidth = 0

  React.useEffect(() => {
    if (scrollView.current && scrollOffsetMinutes && Platform.OS !== 'ios') {
      // We add delay here to work correct on React Native
      // see: https://stackoverflow.com/questions/33208477/react-native-android-scrollview-scrollto-not-working
      setTimeout(
        () => {
          if (scrollView && scrollView.current) {
            scrollView.current.scrollTo({
              y: (cellHeight * scrollOffsetMinutes) / 60,
              animated: false,
            })
          }
        },
        Platform.OS === 'web' ? 0 : 10,
      )
    }
  }, [scrollView, scrollOffsetMinutes, cellHeight])

  const panResponder = usePanResponder({
    onSwipeHorizontal,
  })

  const _onPressCell = React.useCallback(
    (date: dayjs.Dayjs) => {
      onPressCell && onPressCell(date.toDate())
    },
    [onPressCell],
  )

  const whichDay = (event) => {
    let dayMove: number = (event.moveX - event.x0) / daysWidth
    let hourMove: number = (event.moveY - event.y0) / 41.66
    console.log('you moved ' + dayMove + ' day and ' + hourMove + ' hours')
    return moveCallBack({ dayMove: dayMove, hourMove: hourMove })
  }

  const setViewOffset = (x: number, y: number, width: number, height: number) => {
    layoutProps.current = { x, y, width, height }
  }

  const _renderMappedEvent = (event: ICalendarEvent<T>) => (
    <CalendarEvent
      key={`${event.start}${event.title}${event.end}`}
      event={event}
      onPressEvent={onPressEvent}
      eventCellStyle={eventCellStyle}
      showTime={showTime}
      eventCount={getCountOfEventsAtEvent(event, events)}
      eventOrder={getOrderOfEvent(event, events)}
      overlapOffset={overlapOffset}
      renderEvent={renderEvent}
      ampm={ampm}
      moveCallBack={whichDay}
    />
  )

  const theme = useTheme()

  return (
    <ScrollView
      onLayout={(event) => {
        var { x, y, width, height } = event.nativeEvent.layout
        setViewOffset(x, y, width, height)
      }}
      ref={scrollView}
      scrollEventThrottle={32}
      {...(Platform.OS !== 'web' ? panResponder.panHandlers : {})}
      showsVerticalScrollIndicator={false}
      nestedScrollEnabled
      contentOffset={Platform.OS === 'ios' ? { x: 0, y: scrollOffsetMinutes } : { x: 0, y: 0 }}
    >
      {dateRange.map((date) =>
        events
          .filter(({ start }) =>
            dayjs(start).isBetween(date.startOf('day'), date.endOf('day'), null, '[)'),
          )
          .map(_renderMappedEvent),
      )}
      {dateRange.map((date) =>
        events
          .filter(
            ({ start, end }) =>
              dayjs(start).isBefore(date.startOf('day')) &&
              dayjs(end).isBetween(date.startOf('day'), date.endOf('day'), null, '[)'),
          )
          .map((event) => ({
            ...event,
            start: dayjs(event.end).startOf('day'),
          }))
          .map(_renderMappedEvent),
      )}
      {dateRange.map((date) =>
        events
          .filter(
            ({ start, end }) =>
              dayjs(start).isBefore(date.startOf('day')) && dayjs(end).isAfter(date.endOf('day')),
          )
          .map((event) => ({
            ...event,
            start: dayjs(event.end).startOf('day'),
            end: dayjs(event.end).endOf('day'),
          }))
          .map(_renderMappedEvent),
      )}
      <View
        style={[u['flex-1'], theme.isRTL ? u['flex-row-reverse'] : u['flex-row']]}
        // {...(Platform.OS === 'web' ? panResponder.panHandlers : {})}
      >
        <View style={[u['z-20'], u['w-50']]}>
          {hours.map((hour) => (
            <HourGuideColumn key={hour} cellHeight={cellHeight} hour={hour} ampm={ampm} />
          ))}
        </View>
        {dateRange.map((date) => (
          <View
            style={[u['flex-1'], u['overflow-hidden']]}
            key={date.toString()}
            onLayout={(event) => {
              var { width } = event.nativeEvent.layout
              if (parseInt(date.format('D')) % 7 == 0) {
                daysWidth = width
              }
            }}
          >
            {hours.map((hour) => (
              <HourGuideCell
                key={hour}
                cellHeight={cellHeight}
                date={date}
                hour={hour}
                onPress={_onPressCell}
              />
            ))}

            {/* Render events of this date */}
            {/* M  T  (W)  T  F  S  S */}
            {/*       S-E             */}
            {/* {events
              .filter(({ start }) =>
                dayjs(start).isBetween(date.startOf('day'), date.endOf('day'), null, '[)'),
              )
              .map(_renderMappedEvent)} */}

            {/* Render events which starts before this date and ends on this date */}
            {/* M  T  (W)  T  F  S  S */}
            {/* S------E              */}
            {/* {events
              .filter(
                ({ start, end }) =>
                  dayjs(start).isBefore(date.startOf('day')) &&
                  dayjs(end).isBetween(date.startOf('day'), date.endOf('day'), null, '[)'),
              )
              .map((event) => ({
                ...event,
                start: dayjs(event.end).startOf('day'),
              }))
              .map(_renderMappedEvent)} */}

            {/* Render events which starts before this date and ends after this date */}
            {/* M  T  (W)  T  F  S  S */}
            {/*    S-------E          */}
            {/* {events
              .filter(
                ({ start, end }) =>
                  dayjs(start).isBefore(date.startOf('day')) &&
                  dayjs(end).isAfter(date.endOf('day')),
              )
              .map((event) => ({
                ...event,
                start: dayjs(event.end).startOf('day'),
                end: dayjs(event.end).endOf('day'),
              }))
              .map(_renderMappedEvent)} */}

            {isToday(date) && !hideNowIndicator && (
              <View
                style={[
                  styles.nowIndicator,
                  { backgroundColor: theme.palette.nowIndicator },
                  { top: `${getRelativeTopInDay(now)}%` },
                ]}
              />
            )}
          </View>
        ))}
      </View>
    </ScrollView>
  )
}

export const CalendarBody = typedMemo(_CalendarBody)
