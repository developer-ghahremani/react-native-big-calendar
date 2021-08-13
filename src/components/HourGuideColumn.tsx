import * as React from 'react'
import { Text, View } from 'react-native'

import { u } from '../commonStyles'
import { useTheme } from '../theme/ThemeContext'
import { formatHour } from '../utils'

interface HourGuideColumnProps {
  cellHeight: number
  hour: number
  ampm: boolean
}

const _HourGuideColumn = ({ cellHeight, hour, ampm }: HourGuideColumnProps) => {
  const theme = useTheme()
  const textStyle = React.useMemo(
    () => ({ color: theme.palette.gray[500], fontSize: theme.typography.xs.fontSize }),
    [theme],
  )

  return (
    <View style={{ height: cellHeight }}>
      {hour != 0 && (
        <Text style={[textStyle, u['text-center'], u['mt--6']]}>{formatHour(hour, ampm)}</Text>
      )}
    </View>
  )
}

export const HourGuideColumn = React.memo(_HourGuideColumn, () => true)
