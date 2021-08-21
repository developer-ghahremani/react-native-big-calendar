import dayjs from 'dayjs'
import moment from 'jalali-moment'
import * as React from 'react'
import { Text, TouchableOpacity, View, ViewStyle } from 'react-native'

import { eventCellCss, u } from '../commonStyles'
import { ICalendarEvent } from '../interfaces'
import { useTheme } from '../theme/ThemeContext'
import { isToday, transformToPersianNumbers, typedMemo } from '../utils'

export interface CalendarHeaderProps<T> {
  dateRange: dayjs.Dayjs[]
  cellHeight: number
  style: ViewStyle
  allDayEvents: ICalendarEvent<T>[]
  DayNumberContainerStyle: ViewStyle
  events: ICalendarEvent<T>[]
  onPressDateHeader?: (date: Date) => void
}

function _CalendarHeader<T>({
  dateRange,
  cellHeight,
  style,
  allDayEvents,
  onPressDateHeader,
  DayNumberContainerStyle,
  events,
}: CalendarHeaderProps<T>) {
  const _onPress = React.useCallback(
    (date: Date) => {
      onPressDateHeader && onPressDateHeader(date)
    },
    [onPressDateHeader],
  )

  const theme = useTheme()

  const borderColor = { borderColor: theme.palette.gray['200'] }
  const primaryBg = { backgroundColor: theme.palette.primary.main }

  const todayColor = (date) => {
    const todayEvents = events
      .filter(({ start }) =>
        dayjs(start).isBetween(date.startOf('day'), date.endOf('day'), null, '[)'),
      )
      .map((i) => {
        return {
          color: parseInt(i.color.substring(1, 6), 16),
          duration: dayjs(i.end).diff(dayjs(i.start), 'hour', true),
        }
      })
    if (todayEvents.length == 0) return { backgroundColor: DayNumberContainerStyle.backgroundColor }
    console.log(todayEvents)
    let weightedColor = 0
    todayEvents.forEach((element) => {
      weightedColor = weightedColor + element.color
    })
    weightedColor = weightedColor / todayEvents.length
    var intWeightedColor = '#' + weightedColor.toString(16).toUpperCase()
    while (intWeightedColor.length < 7) intWeightedColor = intWeightedColor + '0'
    console.log(intWeightedColor)
    return { backgroundColor: intWeightedColor }
  }

  return (
    <View
      style={[
        u['border-b-2'],
        u['pt-2'],
        borderColor,
        theme.isRTL ? u['flex-row-reverse'] : u['flex-row'],
        style,
      ]}
    >
      <View style={[u['w-50'], u['items-center']]}>
        <Text style={[theme.typography.xs, u['mb-4']]}>Week</Text>
        <View style={[u['w-36'], u['h-36'], u['bordered'], u['justify-center'], u['items-center']]}>
          <Text style={[theme.typography.xl]}>4</Text>
        </View>
        <Text style={[theme.typography.xs, u['mt-6']]}>All day</Text>
      </View>
      {dateRange.map((date) => {
        const _isToday = isToday(date)
        return (
          <TouchableOpacity
            style={[u['flex-1'], u['pt-2'], u['mb-2']]}
            onPress={() => _onPress(date.toDate())}
            disabled={onPressDateHeader === undefined}
            key={date.toString()}
          >
            <View style={[u['justify-between'], { minHeight: cellHeight }]}>
              <Text
                style={[
                  theme.typography.xs,
                  u['text-center'],
                  u['mb-4'],
                  { color: _isToday ? theme.palette.primary.main : theme.palette.gray['500'] },
                ]}
              >
                {date.format('ddd')[0]}
              </Text>
              <View
                style={
                  !_isToday
                    ? [
                        primaryBg,
                        u['h-36'],
                        u['w-36'],
                        u['rounded-full'],
                        u['items-center'],
                        u['justify-center'],
                        u['self-center'],
                        u['z-20'],
                        DayNumberContainerStyle,
                        todayColor(date),
                      ]
                    : [
                        primaryBg,
                        u['h-36'],
                        u['w-36'],
                        u['pb-2'],
                        u['rounded-full'],
                        u['items-center'],
                        u['justify-center'],
                        u['self-center'],
                        u['z-20'],
                        {
                          backgroundColor: '#0',
                          borderWidth: 2.5,
                          borderColor: DayNumberContainerStyle.backgroundColor,
                        },
                        todayColor(date),
                      ]
                }
              >
                <Text
                  style={[
                    {
                      color: !_isToday
                        ? theme.palette.primary.contrastText
                        : theme.palette.gray['800'],
                    },
                    theme.typography.sm,
                    u['text-center'],
                    //Platform.OS === 'web' && _isToday && u['mt-6'],
                  ]}
                >
                  {date.format('D')}
                </Text>
                <Text
                  style={[
                    {
                      color: !_isToday
                        ? theme.palette.primary.contrastText
                        : theme.palette.gray['800'],
                    },
                    theme.typography.xs,
                    u['text-center'],
                    //Platform.OS === 'web' && _isToday && u['mt-6'],
                  ]}
                >
                  {transformToPersianNumbers(
                    moment(date.format('YYYY-M-D'), 'YYYY-M-D HH:mm:ss').locale('fa').format('D'),
                  )}
                </Text>
              </View>
            </View>
            <View
              style={[{ borderColor: theme.palette.gray['200'] }, u['mt-2'], { minHeight: 20 }]}
            >
              {allDayEvents.map((event) => {
                if (!dayjs(event.start).isSame(date, 'day')) {
                  return null
                }
                return (
                  <View
                    style={[eventCellCss.style, primaryBg]}
                    key={`${event.start}${event.title}`}
                  >
                    <Text
                      style={{
                        fontSize: 8,
                        color: theme.palette.primary.contrastText,
                      }}
                    >
                      {event.title}
                    </Text>
                  </View>
                )
              })}
            </View>
          </TouchableOpacity>
        )
      })}
    </View>
  )
}

export const CalendarHeader = typedMemo(_CalendarHeader)
