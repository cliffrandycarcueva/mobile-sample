import React from 'react';
import {
  Image,
  StyleSheet,
  View,
  InteractionManager,
  BackHandler,
}
  from 'react-native';
import PropTypes from 'prop-types';
import { getStatusBarHeight } from 'react-native-status-bar-height';
import {  Header as ExtHeader } from 'react-native-elements';
import { connect } from 'react-redux';
import MText from '../../components/basics/text';
import ShopperService from '../../services/shopperService';
import { screenWt } from '../../styles/defaultStyle';
import Colours from '../../styles/Colours';
import { Constants, ScreenName, appVersion } from '../../common/constants';
import Icons from '../../components/basics/icons';
import * as defaultStyle from '../../styles/defaultStyle';
import Images from '../../components/basics/Images';
import dim from '../../common/dim';
import { IsEmpty } from '../../common/utils';
import MButton from '../../components/basics/MButton';
import apiServiceV2 from '../../services/apiServiceV2';
import font from '../../common/font';

const defaultTextSize = font.scale39;

const styles = StyleSheet.create({
  textStyle: {
    color:      Colours.White,
    fontFamily: defaultStyle.fontRegular,
    textAlign:  'center',
    fontSize:   dim.fixed40,
    lineHeight: dim.fixed40,
  },
  modalText: {
    marginBottom: dim.fixed45,
    textAlign:    'center',
  },
  label: {
    justifyContent: 'center',
    alignContent:   'center',
    marginTop:      dim.scale60,
  },
  input: {
    fontFamily:        defaultStyle.fontRegular,
    fontSize:          defaultTextSize,
    marginLeft:        0,
    paddingVertical:   0,
    paddingHorizontal: 0,
  },
  inputContainer: {
    paddingLeft: 0,
    paddingTop:  0,
    marginTop:   0,
  },
  gridButtonStyle: {
    height:          dim.scale360,
    width:           dim.scale450,
    margin:          dim.scale20,
    flexDirection:   'column-reverse',
    ...defaultStyle.default.btnShadow,
    borderRadius:    dim.fixed5,
    borderWidth:     0,
    backgroundColor: Colours.LightGray3,
  },
});

class ProfileScreen extends React.PureComponent {
  constructor(props) {
    super(props);
    this.state = {
      shopper:      ShopperService.getLoggedInShopper(),
      profileImage: '',

      giveawayData: '',
      showGiveaway: false,
    };

    this.navigateBack = this.navigateBack.bind(this);
    this.goToLogin = this.goToLogin.bind(this);
    this.backHandler = null;

    this.gridIconSize = dim.scale80;
    this.gridTextSize = font.scale46;
  }

  componentDidMount() {
    this.backHandler = BackHandler.addEventListener('hardwareBackPress', this.navigateBack);
    InteractionManager.runAfterInteractions(async () => {
      try {
        await this.setShopperDetails();

        apiServiceV2.getGiveawayEventStatus()
          .then(() => {
            if (this._isUnmounted) {
              return;
            }
            // So long as we can get data on the giveaway event, display the giveaway btn
            this.setState({ showGiveaway: true });
          })
          .catch((err) => {
            // E.g. API no longer exist, no internet and etc, don't show the giveAway btn
            console.log('ProfileScreen, getGiveawayEventStatus() error: ', err);
            if (this._isUnmounted) {
              return;
            }
            this.setState({ showGiveaway: false });
          });
      } catch (err) {
        console.log('Error in ProfileScreen componentDidMount() - ', err);
      }
    });
  }

  componentWillUnmount() {
    try {
      if (this.backHandler) {
        this.backHandler.remove();
      }
    } catch (err) { /** ignore */ }
  }

  componentDidUpdate(prevProps) {
    if (prevProps.shopperLoginStatus !== this.props.shopperLoginStatus) {
      this.setState({ shopper: ShopperService.getLoggedInShopper() }, () => {
        this.setShopperDetails();
      });
    }
  }

  async setShopperDetails() {
    if (!IsEmpty(this.state.shopper)) {
      this.setState({
        profileImage: this.state.shopper.profileImage,
      });
    }
  }

  navigateBack() {
    if (IsEmpty(ShopperService.getLoggedInShopper())) {
      // return false to let main navigator's back handler take over
      return false;
    }
  }

  goToLogin() {
    this.props.navigation.navigate(ScreenName.LoginScreen, { previous_screen: ScreenName.ProfileScreen });
  }

  renderProfilePictureWithName() {
    return (
      <View style={{ width: dim.scale1080, marginTop: dim.fixed20, marginBottom: dim.fixed20 }}>
        <View style={{ zIndex: 2, alignItems: 'center' }}>
          <Image
            source={!IsEmpty(this.props.shopperProfileImage) ? { uri: this.props.shopperProfileImage } : Constants.DefaultUserImage}
            style={{
              width:        dim.scale360,
              height:       dim.scale360,
              borderRadius: dim.scale360,
              borderColor:  Colours.LightGray4,
              borderWidth:  dim.fixed8,
            }}
            resizeMode="cover"
          />
          <View style={{ marginTop: dim.fixed30, alignItems: 'center' }}>
            <MText text={`Hello, `} textSize={font.scale46} />
            <MText text={`${this.props.shopperLoginStatus ? IsEmpty(this.props.shopperName) ? '' : this.props.shopperName : 'Guest'}`} textSize={font.scale46} />
          </View>
        </View>
      </View>
    );
  }

  renderGrid() {
    return (
      <View style={{ justifyContent: 'flex-start', marginTop: dim.scale450, flexDirection: 'row', flexWrap: 'wrap', marginHorizontal: dim.scale50 }}>
        {
          this.state.showGiveaway
            && (
              <MButton
                text="Monstyr Giveaway"
                textSize={this.gridTextSize}
                textStyle={{ textAlign: 'center' }}
                icon={Icons.GiveawayIcon}
                iconSize={this.gridIconSize}
                onPress={() => {
                  this.props.navigation.navigate(ScreenName.GiveawayInfoScreen, { shopper: this.state.shopper, giveawayData: this.state.giveawayData });
                }}
                style={styles.gridButtonStyle}
              />
            )
        }
        <MButton
          text="Profile"
          textSize={this.gridTextSize}
          textStyle={{ textAlign: 'center', marginBottom: dim.fixed5 }}
          icon={Icons.ProfileIcon}
          iconSize={this.gridIconSize}
          onPress={() => this.props.navigation.navigate(ScreenName.ProfileInfoScreen)}
          style={styles.gridButtonStyle}
        />
        <MButton
          text={`Gifs, Stickers\n& Wallpapers`}
          textSize={this.gridTextSize}
          icon={Icons.StickerIcon}
          iconSize={this.gridIconSize}
          iconStyle={{ marginTop: dim.scale5 }}
          onPress={() => this.props.navigation.navigate(ScreenName.StickerHome)}
          style={styles.gridButtonStyle}
        />
        <MButton
          text="Settings"
          textSize={this.gridTextSize}
          textStyle={{ textAlign: 'center', marginBottom: dim.fixed5 }}
          icon={Icons.MaterialSettingIcon}
          iconSize={this.gridIconSize}
          onPress={() => this.props.navigation.navigate(ScreenName.SettingsScreen)}
          style={styles.gridButtonStyle}
        />
      </View>
    );
  }

  async validateProfileImage(shopper) {
    //to be passed to details screen for change profile picture operation
    if (IsEmpty(shopper.profileImage)) { return null; } else {
      this.setState({
        profileImage: shopper.profileImage,
      });
    }
  }

  render() {
    return (
      <View style={{ flex: 1, backgroundColor: Colours.White }}>
        <ExtHeader
          containerStyle={{
            backgroundColor:   '#BF84BF',
            borderBottomColor: 'transparent',
            paddingTop:        0,
            position:          'absolute',
          }}
          barStyle="dark-content"
          statusBarProps={{
            translucent:     true,
            backgroundColor: 'transparent',
          }}
          placement="center"
        />

        {/* The Monstyr image must be drawn after the profile pic so that one of its hands is 'grabbing' the profile pic */}
        <View style={{
          width:             '100%',
          height:            getStatusBarHeight() + dim.scale230,
          borderBottomWidth: dim.fixed5,
          borderBottomColor: Colours.LightGray3,
          backgroundColor:   Colours.White,
          zIndex:            1,
          flexDirection:     'row',
        }}
        >
          <View style={{  position: 'absolute', top: getStatusBarHeight(), left: dim.scale315 }}>
            <Image
              source={Images.Local.Banner.Profile}
              style={{
                resizeMode: 'cover',
                width:      dim.scale1080,
                height:     dim.scale225,
                bottom:     -dim.fixed2,
                zIndex:     3,
              }}
            />
          </View>

          <View style={{
            width:          screenWt,
            flexDirection:  'row',
            justifyContent: 'center',
            marginTop:      getStatusBarHeight() + dim.scale105,
          }}
          >
            {this.renderProfilePictureWithName()}
          </View>
        </View>

        {this.renderGrid()}

        {
          appVersion && (
            <View style={{ alignSelf: 'center', alignItems: 'center', flex: 1, marginTop: dim.scale250 }}>
              <MText text={`Version ${appVersion}`} color={Colours.LightGray2} textSize={font.scale34} />
            </View>
          )
        }

      </View>

    );
  }
}

ProfileScreen.propTypes = {
  navigation: PropTypes.shape({
    navigate: PropTypes.func.isRequired,
  }).isRequired,

  shopperLoginStatus:  PropTypes.bool.isRequired,
  shopperName:         PropTypes.string,
  shopperProfileImage: PropTypes.string,
};

ProfileScreen.defaultProps = {
  shopperName: '',
};

ProfileScreen.defaultProps = {
  shopperProfileImage: '',
};

const mapStateToProps = (state) => ({
  shopperLoginStatus:  state.shopper.loginStatus,
  shopperName:         state.shopper.shopper?.name,
  shopperProfileImage: state.shopper.shopper?.profileImage,
});

export default connect(mapStateToProps)(ProfileScreen);
