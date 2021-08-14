import dayjs from 'dayjs'
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
  onPressDateHeader?: (date: Date) => void
}

function _CalendarHeader<T>({
  dateRange,
  cellHeight,
  style,
  allDayEvents,
  onPressDateHeader,
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
      <View style={[u['w-50'], u['items-center'], u['justify-center']]}>
        <Text style={[theme.typography.xs]}>Week</Text>
        <View style={[u['w-36'], u['h-36'], u['bordered'], u['justify-center'], u['items-center']]}>
          <Text style={[theme.typography.xl]}>4</Text>
        </View>
        <Text style={[theme.typography.xs]}>All day</Text>
      </View>
      {dateRange.map((date, index) => {
        const _isToday = isToday(date)
        return (
          <TouchableOpacity
            style={[u['flex-1'], u['pt-2']]}
            onPress={() => _onPress(date.toDate())}
            disabled={onPressDateHeader === undefined}
            key={date.toString()}
          >
            <View style={[u['justify-between'], { height: cellHeight }]}>
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
                        { backgroundColor: '#' + index.toString().repeat(6) },
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
                        u['border-red'],
                        { backgroundColor: '#0' },
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
                  {transformToPersianNumbers(date.format('D'))}
                </Text>
              </View>
            </View>
            <View
              style={[u['border-l'], { borderColor: theme.palette.gray['200'] }, { height: 18 }]}
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
                        fontSize: theme.typography.sm.fontSize,
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
