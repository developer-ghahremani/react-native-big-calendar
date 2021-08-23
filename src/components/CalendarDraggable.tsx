import React, { useRef } from 'react'
import { Animated, Dimensions, PanResponder, StyleSheet } from 'react-native'

export interface panXY {
  _value: number
}
export interface currentType {
  x: any
  y: any
  setOffset: any
  flattenOffset: any
}

export const Draggable = (props) => {
  const pan: currentType = useRef(new Animated.ValueXY()).current
  console.log('here is pan: ')
  console.log(pan)

  const panResponder = useRef(
    PanResponder.create({
      onMoveShouldSetPanResponder: () => true,
      onPanResponderGrant: () => {
        pan.setOffset({
          x: pan.x._value,
          y: pan.y._value,
        })
      },
      onPanResponderMove: Animated.event([null, { dx: pan.x, dy: pan.y }], {
        useNativeDriver: true,
      }),
      onPanResponderRelease: (_e, gestureState) => {
        pan.flattenOffset()
        console.log('here is gesture state:')
        console.log(gestureState)
        props.moveCallBack(gestureState)
      },
    }),
  ).current

  const day = props.touchableOpacityProps.key.substring(0, 2)
  const days = ['Su', 'Mo', 'Tu', 'We', 'Th', 'Fr', 'Sa']
  const dayDif = days.indexOf(day)
  const marginLeft = dayDif * 14.28
  const minusLeft = dayDif * 7.14
  const a = Dimensions.get('screen').width
  const leftCss = (marginLeft * a) / 100 - minusLeft
  const widthCss = a / 7 - 10

  return (
    <Animated.View
      style={[
        (props.touchableOpacityProps && props.touchableOpacityProps.style) || styles.box,
        {
          marginLeft: leftCss,
          width: widthCss,
          transform: [{ translateX: pan.x }, { translateY: pan.y }],
        },
      ]}
      {...panResponder.panHandlers}
    >
      {props.children}
    </Animated.View>
  )
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  titleText: {
    fontSize: 14,
    lineHeight: 24,
    fontWeight: 'bold',
  },
  box: {
    height: 100,
    width: 100,
    backgroundColor: 'blue',
    borderRadius: 5,
  },
})
