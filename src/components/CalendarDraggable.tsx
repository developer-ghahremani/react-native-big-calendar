import React, { useRef } from 'react'
import { Animated, PanResponder, StyleSheet } from 'react-native'

export const Draggable = (props: any) => {
  const pan = useRef(new Animated.ValueXY()).current

  const panResponder = useRef(
    PanResponder.create({
      onMoveShouldSetPanResponder: () => true,
      onPanResponderGrant: () => {
        console.log('huh')
        pan.setOffset({
          x: pan.x._value,
          y: pan.y._value,
        })
      },
      onPanResponderMove: Animated.event([null, { dx: pan.x, dy: pan.y }], {
        useNativeDriver: false,
      }),
      onPanResponderRelease: (e, gestureState) => {
        pan.flattenOffset()
        console.log(e)
        props.moveCallBack(gestureState)
      },
    }),
  ).current

  const day = props.touchableOpacityProps.key.substring(0, 2)
  const days = ['Su', 'Mo', 'Tu', 'We', 'Th', 'fr', 'So']
  const dayDif = days.indexOf(day)
  const marginLeft = dayDif * 14.28
  const minusLeft = dayDif * 7.14
  console.log(dayDif)

  return (
    <Animated.View
      style={[
        (props.touchableOpacityProps && props.touchableOpacityProps.style) || styles.box,
        {
          marginLeft: `calc( ${marginLeft}% - ${minusLeft}px)`,
          width: 'calc(14.28% - 7.14px)',
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
