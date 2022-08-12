import React from 'react';
import {
  View,
  StyleSheet,
  TouchableNativeFeedback,
} from 'react-native';
import PropTypes from 'prop-types';
import { BlurView } from 'expo-blur';
import MText from '../../components/basics/text';
import Colours from '../../styles/Colours';
import defaultStyle, { screenWt, screenHt } from '../../styles/defaultStyle';
import dim from '../../common/dim';
import MButton from '../../components/basics/MButton';
import font from '../../common/font';
import btnStyle from '../../styles/btnStyle';

class ModalOverlay extends React.PureComponent {
  render() {
    return (
      <BlurView
        intensity={50}
        tint="dark"
        style={[StyleSheet.absoluteFill,
          {
            zIndex:         2,
            justifyContent: 'flex-start',
            alignItems:     'center',
          }]}
      >
        <TouchableNativeFeedback onPress={() => this.props.onCancel()}>
          <View style={{ width: screenWt, height: screenHt, backgroundColor: 'transparent' }} />
        </TouchableNativeFeedback>
        <View style={{
          position:          'absolute',
          backgroundColor:   Colours.White,
          alignItems:        'center',
          borderRadius:      dim.fixed10,
          width:             screenWt - dim.scale200,
          minHeight:         dim.scale400,
          marginTop:         screenHt / 4,
          paddingHorizontal: dim.scale65,
          paddingVertical:   dim.scale70,
          ...defaultStyle.shadow,
        }}
        >
          <View style={{ paddingTop: 0, paddingBottom: dim.scale60, alignItems: 'center' }}>
            <MText text="Log Out" bold textSize={font.scale40} style={{ marginBottom: dim.fixed30 }} />
            <View style={{ alignItems: 'center' }}>
              <MText text="Are you sure you want to" align="center" textSize={font.scale40} />
              <MText text="stop browsing the hottest deals" align="center" textSize={font.scale40} />
              <MText text="and the coolest offers?" align="center" textSize={font.scale40} />
            </View>
          </View>
          <View style={{
            flexDirection:  'row',
            width:          '100%',
            justifyContent: 'space-between',
          }}
          >
            <MButton
              text="Yes"
              textStyle={{ ...btnStyle.cancelText }}
              style={{
                width: dim.scale360,
                ...btnStyle.cancel,
              }}
              onPress={() => { this.props.onLogout(); }}
            />
            <MButton
              text="Cancel"
              textStyle={{ ...btnStyle.executeText }}
              style={{
                width: dim.scale360,
                ...btnStyle.execute,
              }}
              onPress={() => { this.props.onCancel(); }}
            />
          </View>
        </View>
      </BlurView>
    );
  }
}

ModalOverlay.propTypes = {
  onCancel: PropTypes.func,
  onLogout: PropTypes.func,
};

ModalOverlay.defaultProps = {
  onCancel: () => { },
  onLogout: () => { },
};

export default ModalOverlay;
