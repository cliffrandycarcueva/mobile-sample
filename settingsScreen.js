import React from 'react';
import { View, StyleSheet, ScrollView, Image } from 'react-native';
import { GoogleSignin } from 'react-native-google-signin';
import PropTypes from 'prop-types';
import { getStatusBarHeight } from 'react-native-status-bar-height';
import { connect } from 'react-redux';
import MButton from '../../components/basics/MButton';
import ShopperService from '../../services/shopperService';
import BackButton from '../../components/basics/backButton';
import { screenWt } from '../../styles/defaultStyle';
import Colours from '../../styles/Colours';
import ModalLogout from './modalLogout';
import { Constants, ScreenName } from '../../common/constants';
import Images from '../../components/basics/Images';
import dim from '../../common/dim';
import Config from '../../config';
import font from '../../common/font';
import shopperAction from '../../actions/shopper';

const { FAQ_URL, PRIVACY_POLICY_URL, DISCLAIMER_URL, TERMS_CONDITIONS_URL, CONTACT_US_URL } = Config;

const textSize = font.scale46;

const styles = StyleSheet.create({
  item: {
    height:         dim.scale120,
    paddingLeft:    dim.fixed50,
    paddingRight:   dim.scale100,
    justifyContent: 'flex-start',
    borderWidth:    0,
    marginBottom:   dim.fixed20,
  },
});

class SettingsScreen extends React.PureComponent {
  constructor(props) {
    super(props);
    this.state = {
      logoutOpen: false,
      shopper:    null,
    };
    this.navigateBack = this.navigateBack.bind(this);
  }

  componentDidMount() {
    try {
      const shopper = ShopperService.getLoggedInShopper();
      this.setState({ shopper });
    } catch (error) {
      console.log('Error in SettingsScreen comDidMount(): ', error);
    }
  }

  componentWillUnmount() {
  }

  onLogout() {
    GoogleSignin.signOut();
    ShopperService.logout();
    this.props.shopperLoginStatusDispatcher(false);
    this.goToLogin();
  }

  goToLogin() {
    this.props.navigation.navigate(ScreenName.WelcomeScreen);
  }

  navigateBack() {
    this.props.navigation.goBack();
    return true;
  }

  renderNotifications() {
    return (
      <View style={{ flexDirection: 'column' }}>
        <MButton
          text="Notifications"
          textSize={textSize}
          onPress={() => { this.props.navigation.navigate(ScreenName.PushNotifSettings); }}
          style={styles.item}
        />
      </View>
    );
  }

  renderPrivacy() {
    return (
      <View style={{ flexDirection: 'column' }}>
        <MButton
          text="Privacy Policy"
          textSize={textSize}
          onPress={() => this.props.navigation.navigate(ScreenName.WebScreen, { url: `${PRIVACY_POLICY_URL}?hideHeader=true`, title: Constants.PrivacyPolicy })}
          style={styles.item}
        />
      </View>
    );
  }

  renderSecurity() {
    return (
      <View style={{ flexDirection: 'column' }}>
        <MButton
          text="Security"
          textSize={textSize}
          onPress={() => {}}
          style={styles.item}
        />
      </View>
    );
  }

  renderDisclaimer() {
    return (
      <View style={{ flexDirection: 'column' }}>
        <MButton
          text="Disclaimer"
          textSize={textSize}
          onPress={() => this.props.navigation.navigate(ScreenName.WebScreen, { url: `${DISCLAIMER_URL}?hideHeader=true`, title: Constants.Disclaimer })}
          style={styles.item}
        />
      </View>
    );
  }

  renderTerms() {
    return (
      <View style={{ flexDirection: 'column' }}>
        <MButton
          text="T&Cs"
          textSize={textSize}
          onPress={() => this.props.navigation.navigate(ScreenName.WebScreen, { url: `${TERMS_CONDITIONS_URL}?hideHeader=true`, title: Constants.TermsAndConditions })}
          style={styles.item}
        />
      </View>
    );
  }

  renderContact() {
    return (
      <View style={{ flexDirection: 'column' }}>
        <MButton
          text="Contact Us"
          textSize={textSize}
          onPress={() => this.props.navigation.navigate(ScreenName.WebScreen, { url: `${CONTACT_US_URL}?hideHeader=true&email=${this.state.shopper?.email || ''}`, title: Constants.ContactUs })}
          style={styles.item}
        />
      </View>
    );
  }

  renderLanguage() {
    return (
      <View style={{ flexDirection: 'column' }}>
        <MButton
          text="Language"
          textSize={textSize}
          onPress={() => {}}
          style={styles.item}
        />
      </View>
    );
  }

  renderResetPW() {
    return (
      <View style={{ flexDirection: 'column' }}>
        <MButton
          text="Reset Password"
          textSize={textSize}
          onPress={() => this.props.navigation.navigate(ScreenName.ResetPasswordScreen, { shopper: this.state.shopper })}
          style={styles.item}
        />
      </View>
    );
  }

  renderTutorial() {
    return (
      <View style={{ flexDirection: 'column' }}>
        <MButton
          text="Tutorial"
          textSize={textSize}
          onPress={() => {}}
          style={styles.item}
        />
      </View>
    );
  }

  renderFAQ() {
    return (
      <View style={{ flexDirection: 'column' }}>
        <MButton
          text="FAQ"
          textSize={textSize}
          onPress={() => this.props.navigation.navigate(ScreenName.WebScreen, { url: `${FAQ_URL}?hideHeader=true`, title: 'FAQ' })}
          style={styles.item}
        />
      </View>
    );
  }

  renderLogout() {
    return (
      <View style={{ flexDirection: 'column' }}>
        <MButton
          text="Log Out"
          textSize={textSize}
          textStyle={{ color: Colours.Black }}
          onPress={() => this.setState({ logoutOpen: true })}
          style={styles.item}
        />
      </View>
    );
  }

  render() {
    return (
      <View style={{ flex: 1, alignContent: 'center', justifyContent: 'center', backgroundColor: Colours.White }}>
        <View style={{
          width:             screenWt,
          height:            getStatusBarHeight() + dim.scale225,
          zIndex:            1,
          borderBottomWidth: dim.fixed5,
          borderBottomColor: Colours.LightGray3,
        }}
        >
          <View style={{ position: 'absolute', width: screenWt, alignItems: 'center', zIndex: 3, bottom: -dim.fixed2  }}>
            <Image
              source={Images.Local.Banner.ProfileSettings}
              style={{
                resizeMode: 'contain',
                width:      dim.scale1080,
                height:     dim.scale225,
              }}
            />
          </View>
        </View>

        <ScrollView
          overScrollMode="never" // improves UI fps on Android 12. No 'stretch' effect on the card on pull.
          style={{ flex: 1 }}
          contentContainerStyle={{
            width:      dim.scale1080,
            alignSelf:  'center',
            paddingTop: dim.scale70,
          }}
        >
          <View style={{
            flex:             1,
            marginHorizontal: dim.scale60,
          }}
          >
            {this.renderFAQ()}
            {/* {this.renderTutorial()} */}
            {/* {this.renderLanguage()} */}
            { this.state.shopper && this.renderNotifications() }
            { this.state.shopper && this.renderResetPW() }
            {this.renderDisclaimer()}
            {this.renderTerms()}
            {this.renderPrivacy()}
            {/* {this.renderSecurity()} */}
            {this.renderContact()}
            { this.state.shopper && this.renderLogout() }
          </View>
        </ScrollView>

        <View style={{ position: 'absolute', top: getStatusBarHeight() + dim.fixed50, left: 0, zIndex: 2 }}>
          <BackButton grayArrow onPress={() => { try { this.navigateBack(); } catch (err) { /** ignore */ } }} />
        </View>

        {
          this.state.logoutOpen
          && (
            <ModalLogout
              onCancel={() => this.setState({ logoutOpen: false })}
              onLogout={() => this.onLogout()}
            />
          )
        }
      </View>
    );
  }
}

SettingsScreen.propTypes = {
  navigation: PropTypes.shape({
    navigate: PropTypes.func.isRequired,
    goBack:   PropTypes.func.isRequired,
  }).isRequired,

  shopperLoginStatusDispatcher: PropTypes.func.isRequired,
};

const mapDispatchToProps = (dispatch) => ({
  shopperLoginStatusDispatcher: (loginStatus) => shopperAction.setShopperLoginStatus(dispatch, loginStatus),
});

export default connect(null, mapDispatchToProps)(SettingsScreen);
