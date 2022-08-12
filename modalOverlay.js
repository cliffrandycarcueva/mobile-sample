import React from 'react';
import {
  View,
  StyleSheet,
  Modal,
} from 'react-native';
import PropTypes from 'prop-types';
import { BlurView } from 'expo-blur';
import { Button } from 'react-native-elements';
import { getStatusBarHeight } from 'react-native-status-bar-height';
import MText from '../../components/basics/text';
import Colours from '../../styles/Colours';
import convert from '../../common/convert';
import * as defaultStyle from '../../styles/defaultStyle';

const styles = StyleSheet.create({
  modalView: {
    margin:          convert.pixel(45),
    backgroundColor: 'white',
    borderRadius:    convert.pixel(20),
    padding:         convert.pixel(45),
    alignItems:      'center',
    justifyContent:  'center',
    elevation:       3,
    width:           defaultStyle.screenWt - convert.pixel(100),
    minHeight:       convert.pixel(400),
  },
  openButton: {
    backgroundColor:   Colours.Purple,
    borderRadius:      convert.pixel(20),
    paddingVertical:   convert.pixel(15),
    paddingHorizontal: convert.pixel(30),
    elevation:         2,
  },
  textStyle: {
    color:     'white',
    fontSize:  convert.pixel(40),
    textAlign: 'center',
  },
  modalText: {
    marginBottom: convert.pixel(30),
    fontSize:     convert.pixel(40),
    textAlign:    'center',
  },
});

class ModalOverlay extends React.PureComponent {
  render() {
    return (
      <Modal
        transparent
        visible={this.props.visible}
        statusBarTranslucent
      >
        <BlurView
          intensity={50}
          tint="dark"
          style={[StyleSheet.absoluteFill,
            {
              flex:           1,
              justifyContent: 'flex-start',
              alignItems:     'flex-start',
              elevation:      6,
              paddingTop:     getStatusBarHeight(),
            }]}
        >
          <View style={styles.modalView}>
            <MText text={this.props.text} style={styles.modalText} />
            <Button
              title="Close"
              buttonStyle={styles.openButton}
              titleStyle={styles.textStyle}
              onPress={() => { this.props.onExit(); }}
            />
          </View>
        </BlurView>
      </Modal>
    );
  }
}

ModalOverlay.propTypes = {
  onExit:  PropTypes.func,
  text:    PropTypes.string,
  visible: PropTypes.bool,
};

ModalOverlay.defaultProps = {
  onExit:  () => { },
  visible: false,
  text:    '',
};

export default ModalOverlay;
