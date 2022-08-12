import React from 'react';
import {
  Image, StyleSheet, View, TouchableOpacity,
  InteractionManager, Keyboard, Alert, Platform, Modal, BackHandler,
  KeyboardAvoidingView, ScrollView, StatusBar, TouchableNativeFeedback,
}
  from 'react-native';
import PropTypes from 'prop-types';
import { getStatusBarHeight } from 'react-native-status-bar-height';
import _ from 'lodash';
import { Input, Header as ExtHeader } from 'react-native-elements';
import * as ImagePicker from 'react-native-image-crop-picker';
import * as FileSystem from 'expo-file-system';
import * as ImageManipulator from 'expo-image-manipulator';
// import { check, request, PERMISSIONS } from 'react-native-permissions';
import { connect } from 'react-redux';
import { BlurView } from 'expo-blur';
import Icons from '../../components/basics/icons';
import MText from '../../components/basics/text';
import ShopperService from '../../services/shopperService';
import { screenWt } from '../../styles/defaultStyle';
import Colours from '../../styles/Colours';
import { Constants, ScreenName, ageGroupPickerItems } from '../../common/constants';
import LoadingIndicator from '../../components/basics/LoadingIndicator';
import * as defaultStyle from '../../styles/defaultStyle';
import UALanding from '../../components/basics/uaLanding';
import MPicker from '../../components/basics/MPicker';
import Images from '../../components/basics/Images';
import dim from '../../common/dim';
import { IsEmpty, nameValidator, StatusToAccessToPhotoLib, StatusToAccessToCamera, RequestAccessToCamera, RequestAccessToPhotoLib, ErrorAlert } from '../../common/utils';
import MButton from '../../components/basics/MButton';
import apiServiceV2 from '../../services/apiServiceV2';
import ModalGender from './modalGenderOption';
import SimpleModal from '../../components/composites/simpleModal';
import font from '../../common/font';
import btnStyle from '../../styles/btnStyle';
import BackButton from '../../components/basics/backButton';

const defaultTextSize = font.scale42;

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
});

class ProfileInfoScreen extends React.PureComponent {
  constructor(props) {
    super(props);
    this.state = {
      shopper:      ShopperService.getLoggedInShopper(),
      profileImage: '',

      originalEmail:    '',
      originalGender:   '',
      originalName:     '',
      originalMobile:   '',
      originalAgeGroup: '',
      name:             '',
      email:            '',
      mobile:           '',
      gender:           Constants.Gender.Others,
      ageGroup:         ageGroupPickerItems[0].value,

      nameError: '',

      hasRemoteImage:        false,
      initialRemoteImageUrl: '',
      showUnSavedAlertModal: false,
      showGenderModal:       false,
      showAgeGpModal:        false,
      isLoading:             false,

      isSuccess:            false,
      showSuccessModal:     false,
      showImageOptionModal: false,
      // mounted:               false, //uncomment if infinite loop happens
    };

    this.navigateBack = this.navigateBack.bind(this);
    this.goToLogin = this.goToLogin.bind(this);
    this.onGenderPress = this.onGenderPress.bind(this);
    this.handleUpdate = this.handleUpdate.bind(this);
    this.backHandler = null;
  }

  componentDidMount() {
    this.backHandler = BackHandler.addEventListener('hardwareBackPress', this.navigateBack);
    InteractionManager.runAfterInteractions(async () => {
      try {
        this.setShopperDetails();

        // to prevent DidUpdate running into infinite loop as setState will be called repeatedly during initial mount
        // this.setState({ mounted: true }); //commented just in case
      } catch (err) {
        console.log('Error in ProfileInfoScreen componentDidMount() - ', err);
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
    //   // if (this.props.isFocused && prevState.mounted === true) {
    //   //   try {
    //   //     //Shopper Comparison
    //   //     const shopper = ShopperService.getLoggedInShopper();
    //   //     if (prevState.shopper !== shopper) {
    //   //       this.setState({ shopper });
    //   //     }
    //   //     if (prevState.shopper && shopper && prevState.shopper.profileImage !== shopper.profileImage) {
    //   //       this.setState({ shopper, initialRemoteImageUrl: shopper.profileImage });
    //   //       this.validateProfileImage(shopper);
    //   //     }
    //   //   } catch (err) {
    //   //     console.log('Error in ProfileInfoScreen componentDidUdpdate() - ', err);
    //   //   }
    //   // }
  }

  async setShopperDetails() {
    if (!IsEmpty(this.state.shopper)) {
      this.setState({
        initialRemoteImageUrl: this.state.shopper.profileImage,
        name:                  this.state.shopper.name,
        email:                 this.state.shopper.email,
        mobile:                this.state.shopper.mobile,
        gender:                this.state.shopper.gender,
        ageGroup:              this.state.shopper.ageGroup ? this.state.shopper.ageGroup : ageGroupPickerItems[0].value,
        originalName:          this.state.shopper.name,
        originalEmail:         this.state.shopper.email,
        originalGender:        this.state.shopper.gender,
        originalMobile:        this.state.shopper.mobile,
        originalAgeGroup:      this.state.shopper.ageGroup ? this.state.shopper.ageGroup : ageGroupPickerItems[0].value,
      });
      await this.validateProfileImage(this.state.shopper);
    }
  }

  navigateBack() {
    if (IsEmpty(ShopperService.getLoggedInShopper())) {
      // return false to let main navigator's back handler take over
      return false;
    }

    let isChanged = false;
    const { name, email, mobile, gender, originalEmail, originalGender, originalName, originalMobile, ageGroup, originalAgeGroup } = this.state;
    if (
      name !== originalName
      || email !== originalEmail
      || mobile !== originalMobile
      || gender !== originalGender
      || ageGroup !== originalAgeGroup) {
      isChanged = true;
    }

    if (isChanged) {
      console.log('1');
      this.setState({ showUnSavedAlertModal: true });
      return true;
    } else if (this.state.showImageOptionModal) {
      this.setState({ showImageOptionModal: false });
      return true;
    } else {
      console.log('2');
      this.props.navigation.navigate(ScreenName.ProfileScreen, { name });
      return false;
    }
  }

  goToLogin() {
    this.props.navigation.navigate(ScreenName.LoginScreen, { previous_screen: ScreenName.ProfileInfoScreen });
  }

  onNameChange(name) {
    const nameError = nameValidator(name);
    this.setState({ name, nameError });
  }

  onEmailChange(email) { this.setState({ email }); }

  onMobileChange(mobile) { this.setState({ mobile }); }

  onAgeGroupChange(ageGroup) { this.setState({ ageGroup }); }

  onGenderPress() {
    Keyboard.dismiss();
    this.setState((prevState) => ({ showGenderModal: !prevState.showGenderModal }));
  }

  onAgeGpPress = () => {
    Keyboard.dismiss();
    this.setState({ showAgeGpModal: true });
  }

  async handleUpdateLocalImage(filename, localUri, type) {
    this.setState({ profileImage: localUri });
    await this.handleUpdateRemoteImage(filename, localUri, type);
  }

  async handleUpdateRemoteImage(filename, uri, type) {
    //Remote Method
    const token = ShopperService.getLoginToken();
    const { shopper } = this.state;
    const data = new FormData();
    data.append('image', {
      name: filename,
      type,
      uri,
    });
    if (!this.state.hasRemoteImage) {
      await apiServiceV2.uploadShopperPicture(token, data).then((pictureURL) => {
        ShopperService.updateShopperProfileImage(shopper.email, pictureURL);
        const updatedShopper = {
          ...shopper,
          profileImage: pictureURL,
        };
        this.setState({ shopper: updatedShopper, hasRemoteImage: true, initialRemoteImageUrl: pictureURL });
      })
        .catch((error) => {
          ErrorAlert(error);
          // this.setState({ profileImage: Constants.DefaultUserImage, hasLocalImage: false });
          this.setState({ profileImage: Constants.DefaultUserImage });
          console.log('Error in uploading remote picture', error);
        });
    } else {
      const imageData = { imageData: this.state.initialRemoteImageUrl };
      await apiServiceV2.removeShopperPicture(token, imageData).then(async (response) => {
        if (response === 'Success') {
          await apiServiceV2.uploadShopperPicture(token, data).then((pictureURL) => {
            ShopperService.updateShopperProfileImage(shopper.email, pictureURL);
            const updatedShopper = {
              ...shopper,
              profileImage: pictureURL,
            };
            this.setState({ shopper: updatedShopper, hasRemoteImage: true, initialRemoteImageUrl: pictureURL });
          })
            .catch((error) => {
              ErrorAlert(error);
              // for cases where it failed, we should revert the operation and do not update the display of profile image to prevent confusion
              // this.setState({ profileImage: this.state.initialRemoteImageUrl, hasLocalImage: false });
              this.setState({ profileImage: this.state.initialRemoteImageUrl });
              console.log('Error in uploading remote picture - changed picture case', error);
            });
        }
      })
        .catch((error) => {
          ErrorAlert(error);
          // for cases where it failed, we should revert the operation and do not update the display of profile image to prevent confusion
          // this.setState({ profileImage: this.state.initialRemoteImageUrl, hasLocalImage: false });
          this.setState({ profileImage: this.state.initialRemoteImageUrl });
          console.log('Error in removing picture', error);
        });
    }
  }

  async openImagePickerAsync(option) {
    let permission = '';
    let status = '';
    const isCamera = option === 'Camera';
    if (isCamera) {
      permission = await StatusToAccessToCamera();
      status = await RequestAccessToCamera();
    } else {
      permission = await StatusToAccessToPhotoLib();
      status = await RequestAccessToPhotoLib();
    }

    if (permission === Constants.Permission.Blocked) {
      Alert.alert(`${option} access`, `Monstyr needs access to ${option} for you to change your profile photo.\n\nPlease change the app's permission under your phone's settings.`);
    } else if (permission === Constants.Permission.Granted || Platform.OS === Constants.OS.iOS) {
      // For some reason the check status to access photo lib for iOS always returns unavailable
      this.handleImagePickerOperation(option);
    } else if (permission === Constants.Permission.Unavailable) {
      Alert.alert(`${option} access`, `Access to ${option} is not available in your device`);
    } else if (status !== Constants.Permission.Granted) {
      Alert.alert(`${option} access`, `Please provide Monstyr access to ${option} for you to change your profile photo.`);
    } else {
      this.handleImagePickerOperation(option);
    }
  }
  //not removed due to legacy code

  //   if (hasPermission === 'denied' || hasPermission === 'unavailable') {
  //   console.log('Requesting...');
  //   request(Platform.OS === 'android' ? PERMISSIONS.ANDROID.WRITE_EXTERNAL_STORAGE : PERMISSIONS.IOS.PHOTO_LIBRARY)
  //     .then(async (result) => {
  //       console.log('request result=', result);
  //       if (result !== 'granted') {
  //         return null;
  //       } else {
  //         await this.handleImagePickerOperation();
  //       }
  //     });
  //   } else if (hasPermission === 'granted') {
  //     await this.handleImagePickerOperation();
  //   }
  // }
  // }

  renderProfilePictureWithName() {
    return (
      <View style={{ width: dim.scale1080, marginTop: dim.fixed20, marginBottom: dim.fixed20 }}>
        <View style={{ zIndex: 2, alignItems: 'center' }}>
          <Image
            source={this.state.profileImage ? { uri: this.state.profileImage } : Constants.DefaultUserImage}
            style={{
              width:        dim.scale360,
              height:       dim.scale360,
              borderRadius: dim.scale360,
              borderColor:  Colours.LightGray4,
              borderWidth:  dim.fixed8,
            }}
            resizeMode="cover"
          />
          <MButton
            icon={Icons.Edit1}
            style={{
              marginTop:    -dim.fixed50,
              width:        dim.scale170,
              height:       dim.scale100,
              borderRadius: dim.fixed50,
            }}
            onPress={() => { this.setState({ showImageOptionModal: true }); }}
          />

        </View>
      </View>
    );
  }

  async handleImagePickerOperation(option) {
    // Display the camera to the user and wait for them to take a photo or to cancel
    try {
      let result;
      if (option === 'Camera') {
        result = await ImagePicker.openCamera({
          width:     400,
          height:    400,
          cropping:  true,
          multiple:  false,
          mediaType: 'photo',
        });
      } else {
        result = await ImagePicker.openPicker({
          width:     400,
          height:    400,
          cropping:  true,
          multiple:  false,
          mediaType: 'photo',
        });
      }

      if (!result) {
        return null;
      } else {
        // user proceed with selecting the picture
        // ImagePicker saves the taken photo to disk and returns a local URI to it
        this.setState({ showImageOptionModal: false });
        const localUri = result.path;
        //checking the size of the image selected
        const { size } = await FileSystem.getInfoAsync(localUri);
        if (size > 20000000) { //reject image size > 20 mb
          Alert.alert('Your image file size is too big, please select another image.');
          return null;
        }
        //resizing the image
        const { uri } = await ImageManipulator.manipulateAsync(
          localUri,
          [{ resize: { width: 400 } }], // resize to width of 400 and preserve aspect ratio
          { compress: 1, format: 'jpeg' },
        );

        const filename = uri.split('/').pop();
        const match = /\.(\w+)$/.exec(filename);
        const type = match ? `image/${match[1]}` : `image/jpeg`;
        await this.handleUpdateLocalImage(filename, uri, type);
      }
    } catch (error) {
      console.log('Error in insertIntoInternalStorage', error);
    }
  }

  renderBackConfirmationModal() {
    return (
      <Modal
        transparent
        visible={this.state.showUnSavedAlertModal}
      >
        <>
          <StatusBar
            barStyle="dark-content"
            backgroundColor={Colours.LightTint}
            translucent
          />
          <View style={{ flex: 1, backgroundColor: Colours.LightTint, paddingTop: defaultStyle.screenHt / 3 }}>
            <View style={{
              margin:          dim.fixed45,
              backgroundColor: Colours.White,
              borderRadius:    dim.fixed20,
              padding:         dim.fixed45,
              alignItems:      'center',
              justifyContent:  'center',
              width:           defaultStyle.screenWt - dim.scale100,
              height:          dim.scale400,
              ...defaultStyle.default.shadow,
            }}
            >
              <MText text="Changes not saved" justify textSize={font.scale40} style={styles.modalText} />
              <View style={{ flexDirection: 'row' }}>
                <MButton
                  text="Discard"
                  textSize={font.scale30}
                  style={{
                    paddingVertical:   dim.fixed15,
                    paddingHorizontal: dim.fixed40,
                    height:            dim.scale90,
                    width:             dim.scale300,
                    borderColor:       Colours.Purple,
                    marginRight:       dim.scale50,
                  }}
                  onPress={() => {
                    this.setState({
                      showUnSavedAlertModal: false,
                      gender:                this.state.originalGender,
                      name:                  this.state.originalName,
                      email:                 this.state.originalEmail,
                      mobile:                this.state.originalMobile,
                      ageGroup:              this.state.originalAgeGroup,
                    });
                  }}
                />
                <MButton
                  text="Back"
                  textSize={font.scale30}
                  style={{
                    paddingVertical:   dim.fixed15,
                    paddingHorizontal: dim.fixed40,
                    height:            dim.scale90,
                    width:             dim.scale300,
                    borderColor:       Colours.Purple,
                  }}
                  onPress={() => { this.setState({ showUnSavedAlertModal: false }); }}
                />
              </View>
            </View>
          </View>
        </>
      </Modal>
    );
  }

  renderChoosePhotoOrCameraModal() {
    return (
      <BlurView
        intensity={50}
        tint="dark"
        style={[StyleSheet.absoluteFill,
          {
            zIndex:          2,
            justifyContent:  'flex-start',
            alignItems:      'flex-start',
            backgroundColor: 'transparent',
          }]}
      >
        <TouchableOpacity onPress={() => this.setState({ showImageOptionModal: false })}>
          <View style={{ width: defaultStyle.screenWt, height: defaultStyle.screenHt, backgroundColor: 'transparent' }} />
        </TouchableOpacity>

        <View style={{
          position:        'absolute',
          backgroundColor: Colours.White,
          borderRadius:    dim.fixed20,
          padding:         dim.fixed45,
          alignItems:      'center',
          justifyContent:  'center',
          alignSelf:       'center',
          width:           defaultStyle.screenWt - dim.scale300,
          minHeight:       dim.scale550,
          marginTop:       dim.scale550,
          margin:          dim.fixed45,
          height:          dim.scale250,
          ...defaultStyle.default.shadow,
        }}
        >
          <View
            style={{
              flexDirection:  'row',
              height:         dim.scale2l0,
              justifyContent: 'space-around',
              alignItems:     'center',
            }}
          >
            <View style={{ flex: 1 }} />

            <View style={{ flex: 1, alignItems: 'flex-end', justifyContent: 'center', paddingBottom: dim.scale60 }}>
              <TouchableOpacity onPress={() => this.setState({ showImageOptionModal: false })}>
                <View style={{ justifyContent: 'center', alignSelf: 'center', paddingRight: 0 }}>
                  <Icons.Close size={dim.scale60} />
                </View>
              </TouchableOpacity>
            </View>
          </View>

          <View style={{ flex: 1, flexDirection: 'column'  }}>
            <MButton
              text="Take Photo"
              textStyle={{  color: Colours.Black  }}
              textSize={font.scale50}
              onPress={() => this.openImagePickerAsync('Camera')}
              style={{ paddingBottom: dim.scale50, borderWidth: 0, borderColor: 'transparent', height: dim.scale180 }}
            />
            <MButton
              text="Choose from Library"
              textStyle={{  color: Colours.Black  }}
              textSize={font.scale50}
              onPress={() => this.openImagePickerAsync('Photo library')}
              style={{ borderWidth: 0, borderColor: 'transparent', height: dim.scale150 }}
            />
          </View>
        </View>
      </BlurView>
    );
  }

  /** When user first enters profile screen before they alter profile picture
   * User might come with both remote and local empty
   * -> nothing happens
   *
   * User might come with Remote URI
   * -> Local file exist
   *    - User local file to display
   *
   * -> Local file does not exist (User deletes on their internal storage)
   *    Use Remote for display, download to local,  reset displayImage attribute
   */
  async validateProfileImage(shopper) {
    //to be passed to details screen for change profile picture operation
    if (IsEmpty(shopper.profileImage)) { return null; } else {
      this.setState({
        profileImage: shopper.profileImage,
      });
    }
  }

  handleUpdate() {
    const { name } = this.state;
    const nameError = nameValidator(name);
    if (!IsEmpty(nameError)) {
      this.setState({ nameError });
      return;
    }

    this.setState({ isLoading: true });
    const data = {
      name:     this.state.name,
      gender:   this.state.gender,
      mobile:   this.state.mobile,
      email:    this.state.email,
      ageGroup: this.state.ageGroup,
    };
    Keyboard.dismiss();

    apiServiceV2.updateShopperProfile(ShopperService.getLoginToken(), data).then((response) => {
      if (response) {
        this.setState({
          originalEmail:    data.email,
          originalGender:   data.gender,
          originalName:     data.name,
          originalMobile:   data.mobile,
          originalAgeGroup: data.ageGroup,
        });
        ShopperService.updateShopperInfo(response);
        this.setState({ isLoading: false, showSuccessModal: true, isSuccess: true });
      }
    }).catch((error) => {
      this.setState({ isLoading: false });
      ErrorAlert(error);
      console.log('Error in update shopper details', error.message);
    });
  }

  render() {
    if (this.props.shopperLoginStatus) {
      return (
        <View style={{ flex: 1, backgroundColor: Colours.White }}>
          {
            this.state.isSuccess && this.state.showSuccessModal
            && <SimpleModal text="Profile updated!" onExit={() => { this.setState({ showSuccessModal: false }); }} />
          }

          {/**Included ext header to prevent status bar prop from being pushed down. For the case
           * where user login and navigate to this screen directly.
           */}

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
            <View style={{ flexDirection: 'row', position: 'absolute', top: getStatusBarHeight(), left: dim.scale315 }}>
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

            {/** Overlay on top of the Monstyr image to detect profile image touch to trigger photo selection */}
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

          <ScrollView
            overScrollMode="never" // improves UI fps on Android 12. No 'stretch' effect on the card on pull.
            keyboardShouldPersistTaps="never"
            style={{ marginTop: dim.scale300, flex: 1, backgroundColor: Colours.White }}
            contentContainerStyle={{
              alignItems: 'center',
            }}
          >
            <View style={{ width: dim.scale780 }}>
              <KeyboardAvoidingView>
                <MText
                  bold
                  text="Name"
                  color={Colours.Black}
                  textSize={defaultTextSize}
                  style={styles.label}
                />
                <Input
                  value={this.state.name}
                  inputStyle={styles.input}
                  containerStyle={styles.inputContainer}
                  onChangeText={(value) => this.onNameChange(value)}
                />
                {
                  !IsEmpty(this.state.nameError)
                    && <MText textSize={font.scale35} text={this.state.nameError} color="#8B0000" style={{ marginLeft: dim.fixed30, marginTop: dim.fixed2 }} />
                }

                <MText
                  bold
                  text="E-mail"
                  color={Colours.Black}
                  textSize={defaultTextSize}
                  style={styles.label}
                />

                <Input
                  disabled
                  value={this.state.email}
                  inputStyle={styles.input}
                  containerStyle={styles.inputContainer}
                  onChangeText={(value) => this.onEmailChange(value)}
                />

                <MText
                  bold
                  text="Mobile"
                  color={Colours.Black}
                  textSize={defaultTextSize}
                  style={styles.label}
                />

                <Input
                  value={this.state.mobile}
                  inputStyle={styles.input}
                  containerStyle={styles.inputContainer}
                  onChangeText={(value) => this.onMobileChange(value)}
                  keyboardType="numeric"
                />

                <MText
                  bold
                  text="Gender"
                  color={Colours.Black}
                  textSize={defaultTextSize}
                  style={styles.label}
                />

                <TouchableOpacity onPress={this.onGenderPress}>
                  <Input
                    value={this.state.gender}
                    inputStyle={styles.input}
                    containerStyle={styles.inputContainer}
                    editable={false}
                    onTouchEnd={this.onGenderPress}
                  />
                </TouchableOpacity>

                <MText
                  bold
                  text="Age Group"
                  color={Colours.Black}
                  textSize={defaultTextSize}
                  style={styles.label}
                />

                <TouchableOpacity onPress={this.onAgeGpPress}>
                  <Input
                    value={this.state.ageGroup}
                    inputStyle={styles.input}
                    containerStyle={styles.inputContainer}
                    editable={false}
                    onTouchEnd={this.onAgeGpPress}
                  />
                </TouchableOpacity>

                {
                  (
                    this.state.name !== this.state.originalName
                    || this.state.email !== this.state.originalEmail
                    || this.state.mobile !== this.state.originalMobile
                    || this.state.gender !== this.state.originalGender
                    || this.state.ageGroup !== this.state.originalAgeGroup)
                  && (
                    <View style={{ marginTop: dim.scale130, alignItems: 'center' }}>
                      <MButton
                        text="Save"
                        textStyle={{ ...btnStyle.executeText }}
                        onPress={this.handleUpdate}
                        style={{
                          width:     dim.scale500,
                          alignSelf: 'center',
                          ...btnStyle.execute,
                        }}
                      />
                    </View>
                  )
                }
                <View style={{ marginTop: dim.scale300 }} />
              </KeyboardAvoidingView>
            </View>
            {this.renderBackConfirmationModal()}
          </ScrollView>

          <TouchableNativeFeedback style={{}} onPress={() => this.setState({ showImageOptionModal: true })}>
            <View style={{
              position:     'absolute',
              top:          getStatusBarHeight() + dim.scale125,
              width:        dim.scale360,
              height:       dim.scale400,
              zIndex:       4,
              marginBottom: dim.fixed20,
              alignSelf:    'center',
            }}
            />
          </TouchableNativeFeedback>

          {
            this.state.showImageOptionModal && this.renderChoosePhotoOrCameraModal()
          }
          {
            this.state.showGenderModal && (
              <ModalGender
                gender={this.state.gender}
                onCancel={() => { this.setState({ showGenderModal: !this.state.showGenderModal }); }}
                onSelect={(selectedGender) => { this.setState({ gender: selectedGender }); }}
              />
            )
          }

          {
            this.state.isLoading && <LoadingIndicator />
          }
          {
            this.state.showAgeGpModal && (
              <MPicker
                selected={this.state.ageGroup}
                widthAdj={screenWt - dim.scale200}
                titleText="Select Age Group"
                onCancel={() => { this.setState({ showAgeGpModal: false }); }}
                onSelect={(selectAgeGroup) => this.onAgeGroupChange(selectAgeGroup)}
                item={ageGroupPickerItems}
              />
            )
          }
          <View style={{ position: 'absolute', top: getStatusBarHeight() + dim.fixed50, left: dim.fixed40, zIndex: 2 }}>
            <BackButton grayArrow onPress={() => { try { this.navigateBack(); } catch (err) { /** ignore */ } }} />
          </View>
        </View>
      );
    } else {
      return (
        <UALanding text={ScreenName.Profile} goToLogin={this.goToLogin} />
      );
    }
  }
}

ProfileInfoScreen.propTypes = {
  navigation: PropTypes.shape({
    navigate: PropTypes.func.isRequired,
  }).isRequired,

  shopperLoginStatus: PropTypes.bool.isRequired,
};

const mapStateToProps = (state) => ({
  shopperLoginStatus: state.shopper.loginStatus,
});

export default connect(mapStateToProps)(ProfileInfoScreen);
