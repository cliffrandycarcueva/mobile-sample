import React from 'react';
import {
  View,
  StyleSheet,
  TouchableOpacity,
} from 'react-native';
import PropTypes from 'prop-types';
import { BlurView } from 'expo-blur';
import MText from '../../components/basics/text';
import Colours from '../../styles/Colours';
import Icons from '../../components/basics/icons';
import { screenWt, screenHt } from '../../styles/defaultStyle';
import dim from '../../common/dim';
import font from '../../common/font';
import { Constants } from '../../common/constants';

const { Gender } = Constants;

const item = [
  { label: Gender.Female,  value: Gender.Female },
  { label: Gender.Male,    value: Gender.Male },
  { label: Gender.Others,  value: Gender.Others },
];

const modalWidth = screenWt - dim.scale250;

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
            alignItems:     'flex-start',
          }]}
      >
        <TouchableOpacity onPress={() => this.props.onCancel()}>
          <View style={{ width: screenWt, height: screenHt, backgroundColor: 'transparent' }} />
        </TouchableOpacity>

        <View style={{
          position:        'absolute',
          backgroundColor: Colours.White,
          borderRadius:    dim.fixed20,
          padding:         dim.fixed45,
          alignItems:      'center',
          justifyContent:  'center',
          alignSelf:       'center',
          width:           modalWidth,
          minHeight:       dim.scale400,
          marginTop:       screenHt / 3,
        }}
        >
          <View
            style={{
              flexDirection:     'row',
              height:            dim.scale120,
              borderBottomColor: Colours.LightGray,
              borderBottomWidth: 0.5,
              justifyContent:    'space-around',
              alignItems:        'center',
              paddingBottom:     dim.fixed30,
            }}
          >
            {/** padding to align text in the center */}
            <View style={{ flex: 1 }} />

            <MText text="Select Gender" bold textSize={font.scale40} />
            <View style={{ flex: 1, alignItems: 'flex-end', justifyContent: 'center', marginBottom: dim.fixed5 }}>
              <TouchableOpacity onPress={() => this.props.onCancel()}>
                <View style={{ justifyContent: 'center', alignSelf: 'center', paddingRight: dim.fixed30 }}>
                  <Icons.Close size={dim.scale60} />
                </View>
              </TouchableOpacity>
            </View>
          </View>

          <View style={{ marginTop: dim.fixed35 }}>
            {item.map((el) => (
              <TouchableOpacity
                key={el.label}
                onPress={() => {
                        this.props.onSelect(el.value);
                        this.props.onCancel();
                }}
              >
                <View style={{ width: modalWidth }}>

                  <MText
                    text={el.label}
                    textSize={font.scale40}
                    style={{
                      borderRadius:    5,
                      textAlign:       'center',
                      paddingVertical: dim.fixed35,
                    }}
                    color={el.value === this.props.gender ? Colours.Black : Colours.LightGray2}
                  />
                </View>
              </TouchableOpacity>
            ))}
          </View>

        </View>
      </BlurView>
    );
  }
}

ModalOverlay.propTypes = {
  onCancel: PropTypes.func,
  onSelect: PropTypes.func,
  gender:   PropTypes.string,
};

ModalOverlay.defaultProps = {
  onCancel: () => { },
  onSelect: () => { },
  gender:   '',
};

export default ModalOverlay;
