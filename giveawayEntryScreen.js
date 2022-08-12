import React, { useEffect, useState } from 'react';
import {
  Image,
  StyleSheet,
  View,
  Keyboard,
  TouchableOpacity,
  KeyboardAvoidingView,
  ScrollView,
  TextInput,
  Alert,
  Platform }
  from 'react-native';
import PropTypes from 'prop-types';
import {  CheckBox } from 'react-native-elements';
import { getStatusBarHeight } from 'react-native-status-bar-height';
import MText from '../../../components/basics/text';
import { fontRegular, screenWt } from '../../../styles/defaultStyle';
import Colours from '../../../styles/Colours';
import Icons from '../../../components/basics/icons';
import dim from '../../../common/dim';
import font from '../../../common/font';
import { emailValidator, IsEmpty, mobileValidator, nameValidator, Sleep } from '../../../common/utils';
import MButton from '../../../components/basics/MButton';
import MPicker from '../../../components/basics/MPicker';
import btnStyle from '../../../styles/btnStyle';
import Images from '../../../components/basics/Images';
import BackButton from '../../../components/basics/backButton';
import { Constants, deviceId, IsPoco, ScreenName, ageGroupPickerItems } from '../../../common/constants';
import apiServiceV2 from '../../../services/apiServiceV2';
import ShopperService from '../../../services/shopperService';
import Analytic from '../../../common/analytic';
import LoadingIndicator from '../../../components/basics/LoadingIndicator';

const defaultTextSize = font.scale40;
const { Gender } = Constants;

const styles = StyleSheet.create({
  textStyle: {
    color:      Colours.White,
    fontFamily: fontRegular,
    textAlign:  'center',
    fontSize:   dim.fixed40,
    lineHeight: dim.fixed40,
  },
  betweenInput: {
    marginBottom: dim.fixed30,
    marginLeft:   dim.scale30,
    marginRight:  dim.scale30,
  },
  modalText: {
    marginBottom: dim.fixed45,
    textAlign:    'center',
  },
  label: {
    flexDirection: 'row',
    marginBottom:  dim.scale20,
    marginLeft:    dim.scale30,
    marginRight:   dim.scale30,
  },
  input: {
    fontFamily: fontRegular,
    fontSize:   defaultTextSize,
    width:      '100%',
    height:     dim.scale115,
    marginLeft: dim.scale10,
    padding:    dim.scale10,
    color:      Colours.Black,
  },
  inputContainer: {
    paddingLeft:     0,
    paddingTop:      0,
    borderWidth:     dim.fixed2,
    borderRadius:    dim.fixed10,
    height:          dim.scale115,
    alignContent:    'center',
    justifyContent:  'center',
    marginBottom:    dim.scale20,
    marginLeft:      dim.scale30,
    marginRight:     dim.scale30,
    backgroundColor: Colours.LightGray3,
  },
  errorContainer: {
    // marginVertical: dim.scale10,
  },
  checkBoxStyle: {
    borderWidth:     0,
    marginVertical:  0,
    paddingVertical: 0,
    paddingRight:    0,
    marginLeft:      dim.scale30,
    marginRight:     dim.scale30,
  },
  checkBoxErrorText: {
    color:      Colours.Red,
    marginLeft: dim.fixed75,
  },

});

const genderItem = [
  {
    label: Gender.Male,
    value: Gender.Male,
  },
  {
    label: Gender.Female,
    value: Gender.Female,
  },
  {
    label: Gender.Others,
    value: Gender.Others,
  },
];

const GiveawayEntryScreen = (props) => {
  const [giveawayTodayData, setGiveawayTodayData] = useState(null);

  const [name, setName] = useState('');
  const [nameError, setNameError] = useState('');

  const [mobile, setMobile] = useState('');
  const [mobileError, setMobileError] = useState('');

  const [email, setEmail] = useState('');
  const [emailError, setEmailError] = useState('');

  const [gender, setGender] = useState('');

  const [ageGroup, setAgeGroup] = useState(ageGroupPickerItems[0].value);

  const [dailyAnswer, setDailyAnswer] = useState('');
  const [dailyAnswerError, setDailyAnswerError] = useState('');

  const [termsConditionsRead, setTermsConditionsRead] = useState(false);
  const [termsConditionsError, setTermsConditionsError] = useState('');

  // modals
  const [showGenderModal, setGenderModal] = useState(false);
  const [showAgeGpModal, setAgeGpModal] = useState(false);
  const [showQNSModal, setQNSModal] = useState(false);

  const [allowMarketing, setAllowMarketing] = useState(true);

  const [registered, setRegistered] = useState(false);

  const [highlightPageId, setHighlightPageId] = useState('');

  const [submitDisabled, setSubmitDisabled] = useState(true);
  const [showLoading, setShowLoading] = useState(true);

  useEffect(() => {
    if (!IsEmpty(props.params.shopper)) {
      const { shopper } = props.params;
      setName(shopper.name);
      setMobile(shopper.mobile);
      setEmail(shopper.email);
      setGender(shopper.gender);
      setAgeGroup(shopper.ageGroup ? shopper.ageGroup : ageGroupPickerItems[0].value);
    }
  }, [props.params.shopper]);

  const onNameChange = (data) => {
    const nameValidation = nameValidator(data);
    setName(data);
    setNameError(nameValidation);
  };

  const onGenderPress = () => {
    Keyboard.dismiss();
    setGenderModal(true);
  };

  const onAgeGpPress = () => {
    Keyboard.dismiss();
    setAgeGpModal(true);
  };

  const onQNSPress = () => {
    Keyboard.dismiss();
    setQNSModal(true);
  };

  const navigateBack = () => {
    props.navigation.goBack();
    return false;
  };

  const onEmailChange = (data) => {
    const emailValidation = emailValidator(data);
    setEmail(data);
    setEmailError(emailValidation);
  };

  const onMobileChange = (data) => {
    const mobileValidation = mobileValidator(data);
    setMobile(data);
    setMobileError(mobileValidation);
  };

  const onGenderChange = (data) => { setGender(data); };

  const onAgeGroupChange = (data) => { setAgeGroup(data); };

  const onDailyAnswerChange = (data) => { setDailyAnswer(data); };

  const handleRegister = async () => {
    if (!IsEmpty(name) && !IsEmpty(email) && !IsEmpty(mobile) && IsEmpty(emailError || nameError || mobileError || dailyAnswerError) && termsConditionsRead) {
      try {
        setShowLoading(true);
        const data = { name, email, mobile, gender, ageGroup, allowMarketing, deviceId };
        const result = await apiServiceV2.registerShopperGiveaway(ShopperService.getLoginToken(), data);
        Analytic.logGiveawaySubmitted(result.giveawayEntryId, ShopperService.getLoggedInShopper());

        // update shopper's data
        const shopperUpdates = {
          name,
          gender,
          mobile,
          ageGroup,
          email: props.params.shopper.email, // email remains the same because email needs to be verified (as it's can be used for email login)
        };
        apiServiceV2.updateShopperProfile(ShopperService.getLoginToken(), shopperUpdates)
          .then((updatedShopper) => {
            if (updatedShopper) {
              ShopperService.updateShopperInfo(updatedShopper);
            }
          }).catch((error) => {
            console.log('Error in update shopper details', error.message);
          });

        await Sleep(500);

        setRegistered(true);
        setHighlightPageId(result.highlightsPageId);
        setShowLoading(false);
        props.params.registrationInfo(true);
      } catch (error) {
        setShowLoading(false);
        Alert.alert('Registration Error', error.message);
      }
    } else {
      if (!termsConditionsRead) {
        setTermsConditionsError (`*required for registration`);
      }
      Alert.alert('Please fill in all the required fields correctly');
    }
  };

  const handleCloseAndNavigate = (screen, { params }) => {
    props.params.toggleRegistrationModalAndNavigate(screen,  { params });
  };

  useEffect(() => {
    if (giveawayTodayData) {
      if (IsEmpty(dailyAnswer)) {
        setDailyAnswerError('');
      } else if (String(dailyAnswer) === String(giveawayTodayData.qnsOfTheDay.answer)) {
        setDailyAnswerError(null);
      } else {
        setDailyAnswerError('Oops, Guess again ;)');
      }
    }
  }, [dailyAnswer]);

  useEffect(() => {
    if (!IsEmpty(name) && !IsEmpty(email) && !IsEmpty(mobile)
      && IsEmpty(emailError || nameError || mobileError)
      // If there is no qns set, then it's okay to proceed without an answer
      && ((giveawayTodayData && giveawayTodayData.qnsOfTheDay && IsEmpty(giveawayTodayData.qnsOfTheDay.choices)) || (dailyAnswer && dailyAnswerError === null))
      && termsConditionsRead) {
      setSubmitDisabled(false);
    } else {
      setSubmitDisabled(true);
    }
  }, [name, email, mobile, termsConditionsRead, dailyAnswer, dailyAnswerError]);

  const downloadTodayGiveawayEvent = async () => {
    try {
      const todayData = await apiServiceV2.getTodayGiveawayEvent(ShopperService.getLoginToken());
      setGiveawayTodayData(todayData);
      setShowLoading(false);
    } catch (error) {
      Alert.alert('', error.message);
      setShowLoading(false);
    }
  };

  useEffect(() => {
    downloadTodayGiveawayEvent();
  }, []);

  return (
    <View
      style={[
        { flex: 1, backgroundColor: Colours.White },
        Platform.OS === 'android' ? { elevation: IsPoco ? 1 : 0 } : {},
      ]}
    >
      {(!registered || IsEmpty(giveawayTodayData)) ? (
        IsEmpty(giveawayTodayData)
          ? null
          : (
            <KeyboardAvoidingView
              style={{
                flex: 1,
              }}
            >
              <View style={{ width: screenWt, marginTop: getStatusBarHeight() + dim.fixed55, alignItems: 'center'  }}>
                <Image
                  source={Images.Local.GiveawayLogo}
                  style={{
                    width:  dim.scale500,
                    height: (dim.scale500 / 1865) * 649,
                  }}
                  resizeMode="cover"
                />
              </View>
              <ScrollView
                overScrollMode="never" // improves UI fps on Android 12. No 'stretch' effect on the card on pull.
                style={{
                  // setting scrollview height
                  // not to conflict with bottom tab
                  // height: '68%',
                  // flex: 1,
                }}
                contentContainerStyle={{ paddingHorizontal: dim.scale40 }}
              >
                <View style={{ justifyContent: 'flex-start', marginBottom: dim.scale80 }}>
                  <View
                    style={{
                      paddingVertical: dim.fixed30,
                      width:           screenWt,
                      alignSelf:       'center',
                      justifyContent:  'center',
                      alignItems:      'center',
                    }}
                  >
                    <MText text="Entry Form" color={Colours.Red} bold textSize={font.scale43} style={{ textAlign: 'center' }} />
                    <MText text="for" textSize={font.scale38} style={{ marginVertical: 0, lineHeight: font.scale38 }} />
                    <MText text={`${giveawayTodayData.date ? giveawayTodayData.date : ''}`} textSize={font.scale38} style={{ marginBottom: dim.scale20 }} bold />
                    <MText underline text={`Be the ${giveawayTodayData.winCriteria ? giveawayTodayData.winCriteria : ''} entry submission\ntoday to win!`} bold textSize={font.scale38} style={{ textAlign: 'center' }} />
                  </View>

                  <View style={{ ...styles.betweenInput, marginTop: 0 }}>
                    <View style={styles.label}>
                      <MText
                        text="Full Name"
                        color={Colours.Black}
                        textSize={defaultTextSize}
                      />
                      <MText text="*" color={Colours.Red} textSize={defaultTextSize} />
                    </View>
                    <View style={styles.inputContainer}>
                      <TextInput
                        isRequired
                        underlineColorAndroid={Colours.Transparent}
                        value={name}
                        style={styles.input}
                        onChangeText={(value) => onNameChange(value)}
                      />
                    </View>
                    {
                      !IsEmpty(nameError) && (
                        <View style={styles.label}>
                          <MText textSize={font.scale35} text={nameError} color="#8B0000" style={styles.errorContainer} />
                        </View>
                      )
                    }
                  </View>
                  <View style={styles.betweenInput}>
                    <View
                      style={{
                        flexDirection: 'row',
                        marginLeft:    dim.scale30,
                        marginRight:   dim.scale30,
                      }}
                    >
                      <MText
                        text="Mobile Phone"
                        color={Colours.Black}
                        textSize={defaultTextSize}
                      />
                      <MText text="*" color={Colours.Red} textSize={defaultTextSize} />
                    </View>
                    <View style={styles.label}>
                      <MText
                        text="Singapore registered phone numbers only"
                        color={Colours.LightGray}
                        textSize={font.scale31}
                      />
                    </View>
                    <View style={{ flexDirection: 'row',  height: dim.scale115, marginBottom: dim.scale20, paddingLeft: dim.scale10 }}>
                      <View style={{ justifyContent: 'center',  marginLeft: dim.scale30, marginRight: 0  }}>
                        <MText text="+65" textSize={defaultTextSize} />
                      </View>
                      <View style={{ ...styles.inputContainer, flex: 1 }}>
                        <TextInput
                          isRequired
                          underlineColorAndroid={Colours.Transparent}
                          value={mobile}
                          style={styles.input}
                          onChangeText={(value) => onMobileChange(value)}
                          keyboardType="numeric"
                        />
                      </View>
                    </View>
                    {
                      !IsEmpty(mobileError) && (
                        <View style={styles.label}>
                          <MText textSize={font.scale35} text={mobileError} color="#8B0000" style={styles.errorContainer} />
                        </View>
                      )
                    }
                  </View>
                  <View style={styles.betweenInput}>
                    <View style={styles.label}>
                      <MText
                        text="E-mail"
                        color={Colours.Black}
                        textSize={defaultTextSize}
                      />
                      <MText text="*" color={Colours.Red} textSize={defaultTextSize} />
                    </View>

                    <View style={styles.inputContainer}>
                      <TextInput
                        isRequired
                        underlineColorAndroid={Colours.Transparent}
                        value={email}
                        style={styles.input}
                        onChangeText={(value) => onEmailChange(value)}
                      />
                    </View>
                    {
                      !IsEmpty(emailError) && (
                        <View style={styles.label}>
                          <MText textSize={font.scale35} text={emailError} color="#8B0000" style={styles.errorContainer} />
                        </View>
                      )
                    }
                  </View>

                  <View style={styles.betweenInput}>
                    <View style={styles.label}>
                      <MText
                        text="Gender"
                        color={Colours.Black}
                        textSize={defaultTextSize}
                      />
                      <MText text="*" color={Colours.Red} textSize={defaultTextSize} />
                    </View>
                    <View style={styles.inputContainer}>
                      <TouchableOpacity onPress={onGenderPress}>
                        <View style={{ height: styles.input.height, paddingHorizontal: dim.fixed20, justifyContent: 'center' }}>
                          <MText text={gender} textSize={styles.input.fontSize} />
                        </View>
                      </TouchableOpacity>
                    </View>
                  </View>
                  <View style={styles.betweenInput}>
                    <View style={styles.label}>
                      <MText
                        text="Age Group"
                        color={Colours.Black}
                        textSize={defaultTextSize}
                      />
                      <MText text="*" color={Colours.Red} textSize={defaultTextSize} />
                    </View>
                    <View style={styles.inputContainer}>
                      <TouchableOpacity onPress={onAgeGpPress}>
                        <View style={{ height: styles.input.height, paddingHorizontal: dim.fixed20, justifyContent: 'center' }}>
                          <MText text={ageGroup} textSize={styles.input.fontSize} />
                        </View>
                      </TouchableOpacity>
                    </View>
                  </View>
                  {
                    (!IsEmpty(giveawayTodayData.qnsOfTheDay) && !IsEmpty(giveawayTodayData.qnsOfTheDay.qns)) && (
                      <View style={styles.betweenInput}>
                        <View style={{ flexDirection: 'row', marginLeft: dim.scale30, marginRight: dim.scale30, marginVertical: dim.scale10   }}>
                          <MText
                            text="Question of the Day"
                            color={Colours.Black}
                            textSize={defaultTextSize}
                          />
                          <MText text="*" color={Colours.Red} textSize={defaultTextSize} />
                        </View>
                        <View style={styles.label}>
                          <MText
                            text={`"${!IsEmpty(giveawayTodayData.qnsOfTheDay.qns) ? giveawayTodayData.qnsOfTheDay.qns : ''}"`}
                            color={Colours.LightGray}
                            textSize={font.scale38}
                          />
                        </View>
                        <View style={{ ...styles.inputContainer, minHeight: styles.inputContainer.height, height: 'auto', justifyContent: 'center', flex: 9 }}>
                          <TouchableOpacity onPress={onQNSPress}>
                            <View style={{ minHeight: styles.input.height, paddingHorizontal: dim.fixed20, justifyContent: 'center' }}>
                              {
                                IsEmpty(dailyAnswer)
                                  ? (
                                    <MText
                                      text="--- Select answer ---"
                                      justify
                                      textSize={styles.input.fontSize}
                                      color={Colours.Gray}
                                      style={{ alignSelf: 'center', fontStyle: 'italic' }}
                                    />
                                  )
                                  : <MText text={dailyAnswer} textSize={styles.input.fontSize} />
                              }
                            </View>
                          </TouchableOpacity>
                        </View>
                        {
                          !IsEmpty(dailyAnswerError)
                            ? (dailyAnswerError !== 'None')
                              && <MText textSize={font.scale34} text={dailyAnswerError} color={Colours.Orange} style={{ ...styles.errorContainer, alignSelf: 'center' }} />
                            : <></>
                        }
                      </View>
                    )
                  }
                  <View style={{ justifyContent: 'space-evenly', height: dim.scale250, marginTop: dim.scale25, paddingHorizontal: dim.fixed10 }}>
                    <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                      <CheckBox
                        containerStyle={styles.checkBoxStyle}
                        checkedColor={Colours.Purple}
                        fontFamily={fontRegular}
                        checked={termsConditionsRead}
                        onPress={() => {
                          Keyboard.dismiss();
                          setTermsConditionsRead(!termsConditionsRead);
                          if (!IsEmpty(termsConditionsError)) {
                            setTermsConditionsError(null);
                          }
                        }}
                      />
                      <View style={{ marginLeft: dim.fixed30, flex: 1, flexDirection: 'row', alignItems: 'center', flexWrap: 'wrap' }}>
                        <MText text="I have read and agreed to Monstyr Giveaway's " textSize={font.scale31} />
                        <TouchableOpacity
                          onPress={() => props.params.termsConditionsClicked()}
                        >
                          <MText
                            text="Terms & Conditions"
                            textSize={font.scale31}
                            color={Colours.Blue}
                            underline
                          />
                        </TouchableOpacity>
                        <MText text="*" color={Colours.Red} textSize={font.scale31} />
                      </View>
                    </View>
                    {
                      !IsEmpty(termsConditionsError) && (
                        <MText
                          text={termsConditionsError}
                          textAlign="left"
                          style={{ ...styles.checkBoxErrorText, marginTop: -dim.scale50 }}
                          textSize={font.scale30}
                        />
                      )
                    }

                    <View style={{ flexDirection: 'row', alignItems: 'center', marginTop: dim.scale25  }}>
                      <CheckBox
                        containerStyle={styles.checkBoxStyle}
                        checkedColor={Colours.Purple}
                        fontFamily={fontRegular}
                        checked={allowMarketing}
                        onPress={() => {
                          Keyboard.dismiss();
                          setAllowMarketing(!allowMarketing);
                        }}
                      />
                      <View style={{ marginLeft: dim.fixed30,  marginRight: dim.scale30, flex: 1, flexDirection: 'row', alignItems: 'center', flexWrap: 'wrap' }}>
                        <MText
                          text="I would like to receive promotional, marketing and other publicity information from Monstyr from time to time. "
                          textSize={font.scale30}
                        />
                      </View>

                    </View>
                    <View
                      style={{
                        marginLeft:  dim.scale30,
                        marginRight: dim.scale30,
                      }}
                    >
                      <MText
                        text="* required"
                        color={Colours.Red}
                        textSize={font.scale31}
                        style={{ fontStyle: 'italic' }}
                      />
                    </View>
                  </View>
                  <View style={{  alignItems: 'center', flex: 1 }}>
                    <MButton
                      disabled={submitDisabled}
                      text="Submit"
                      textBold
                      textSize={font.scale40}
                      textStyle={{ color: Colours.White, paddingHorizontal: dim.fixed50 }}
                      style={{ ...btnStyle.goldButton, width: dim.scale500, height: dim.scale120, backgroundColor: submitDisabled ? Colours.LightGray2 : Colours.Gold }}
                      onPress={() => handleRegister()}
                    />
                  </View>
                </View>
              </ScrollView>
              <View style={{ position: 'absolute', top: getStatusBarHeight() + dim.fixed55, left: dim.fixed40, zIndex: 2 }}>
                <BackButton grayArrow onPress={() => { try { navigateBack(); } catch (err) { /** ignore */ } }} />
              </View>
              {
                showGenderModal && (
                  <MPicker
                    selected={gender}
                    item={genderItem}
                    widthAdj={screenWt - dim.scale200}
                    titleText="Select Gender"
                    onCancel={() => { setGenderModal(!showGenderModal); }}
                    onSelect={(selectedGender) => { onGenderChange(selectedGender); }}
                  />
                )
              }
              {
                showAgeGpModal && (
                  <MPicker
                    selected={ageGroup}
                    widthAdj={screenWt - dim.scale200}
                    titleText="Select Age Group"
                    onCancel={() => { setAgeGpModal(!showAgeGpModal); }}
                    onSelect={(selectAgeGroup) => { onAgeGroupChange(selectAgeGroup); }}
                    item={ageGroupPickerItems}
                  />
                )
              }
              {
                showQNSModal && (
                  <MPicker
                    selected={dailyAnswer}
                    titleText="Select Answer"
                    widthAdj={screenWt - dim.scale200}
                    // making height adjustment for very long list
                    heightAdj={!IsEmpty(giveawayTodayData.qnsOfTheDay.choices) && giveawayTodayData.qnsOfTheDay.choices.length > 5 ? '50%' : 'auto'}
                    onCancel={() => { setQNSModal(!showQNSModal); }}
                    onSelect={(selectedAnswer) => { onDailyAnswerChange(selectedAnswer); }}
                    item={!IsEmpty(giveawayTodayData.qnsOfTheDay.choices) ? giveawayTodayData.qnsOfTheDay.choices.map((item) => ({ label: item, value: item })) : []}
                  />
                )
              }
            </KeyboardAvoidingView>
          )
      ) : (
        <View
          style={{
            backgroundColor: Colours.White,
            borderRadius:    dim.fixed20,
            justifyContent:  'flex-start',
          }}
        >
          <View style={{ width: screenWt, marginTop: getStatusBarHeight() + dim.fixed150, alignItems: 'center'  }}>
            <Image
              source={Images.Local.GiveawayLogo}
              style={{
                width:  dim.scale500,
                height: (dim.scale500 / 1865) * 649,
              }}
              resizeMode="cover"
            />
          </View>
          <View style={{ width: '100%',  marginBottom: dim.fixed20, marginTop: dim.fixed30  }}>
            <View style={{ zIndex: 2, alignItems: 'center'  }}>
              <Image
                source={Images.Local.MonstyrThumbsUp}
                style={{
                  width:        dim.scale360,
                  height:       dim.scale360,
                  borderRadius: dim.scale360,
                }}
                resizeMode="cover"
              />
            </View>

          </View>
          <View style={{ alignSelf: 'center', marginTop: dim.scale50 }}>
            <MText textAlign="center" text="Entry submitted, good luck!" color={Colours.Black} bold textSize={font.scale48} />
          </View>

          <View style={{ justifyContent: 'flex-start', flexDirection: 'column', marginTop: dim.scale125, paddingBottom: dim.scale100, paddingHorizontal: dim.fixed75 }}>
            <MButton
              onPress={() => handleCloseAndNavigate(ScreenName.Home, {})}
              text="Check Out Deals"
              textBold
              textSize={font.scale45}
              textStyle={{ color: Colours.White, textAlign: 'center' }}
              style={{ ...btnStyle.goldButton, width: '80%', justifyContent: 'center',  marginBottom: dim.scale40 }}
            />

            <MButton
              onPress={() => handleCloseAndNavigate(ScreenName.Highlight, { params: { id: highlightPageId } })}
              text={`More Contests\n& Lucky Draws`}
              textBold
              textSize={font.scale45}
              textStyle={{ color: Colours.White, textAlign: 'center' }}
              style={{ ...btnStyle.goldButton, width: '80%', justifyContent: 'center' }}
            />
          </View>
          <TouchableOpacity
            onPress={() => navigateBack()}
            style={{
              position: 'absolute',
              top:      dim.scale150,
              right:    dim.scale50 }}
          >
            <Icons.Close size={dim.scale100} color={Colours.Gray} />
          </TouchableOpacity>
        </View>
      )}
      {
        showLoading && <LoadingIndicator colour={Colours.Red} />
      }
    </View>
  );
};

GiveawayEntryScreen.propTypes = {
  navigation: PropTypes.shape({
    navigate: PropTypes.func.isRequired,
    goBack:   PropTypes.func.isRequired,
  }).isRequired,
  params: PropTypes.shape({
    shopper: PropTypes.shape({
      name:     PropTypes.string,
      email:    PropTypes.string,
      mobile:   PropTypes.string,
      gender:   PropTypes.string,
      ageGroup: PropTypes.string,
    }).isRequired,
    toggleRegistrationModalAndNavigate: PropTypes.func.isRequired,
    termsConditionsClicked:             PropTypes.func.isRequired,
    registrationInfo:                   PropTypes.func.isRequired,
  }).isRequired,
};

export default GiveawayEntryScreen;
