import React, { useEffect, useState } from 'react';
import {
  Alert,
  Image,
  StyleSheet,
  View,
}
  from 'react-native';
import PropTypes from 'prop-types';
import { getStatusBarHeight } from 'react-native-status-bar-height';
import { connect } from 'react-redux';
import { ScrollView, TouchableOpacity } from 'react-native-gesture-handler';
import RenderHtml from 'react-native-render-html';
import MText from '../../../components/basics/text';

import  { screenWt } from '../../../styles/defaultStyle';
import Colours from '../../../styles/Colours';

import Images from '../../../components/basics/Images';
import dim from '../../../common/dim';

import MButton from '../../../components/basics/MButton';
import LoadingIndicator from '../../../components/basics/LoadingIndicator';

import font from '../../../common/font';

import BackButton from '../../../components/basics/backButton';
import btnStyle from '../../../styles/btnStyle';
import apiServiceV2 from '../../../services/apiServiceV2';
import ShopperService from '../../../services/shopperService';
import UALanding from '../../../components/basics/uaLanding';
import { Constants, ScreenName } from '../../../common/constants';
import {  IsEmpty, Sleep } from '../../../common/utils';
import Config from '../../../config';
import Icons from '../../../components/basics/icons';

const { Status } = Constants;

const GiveawayInfoScreen = (props) => {
  const [isLoading, setIsLoading] = useState(true);

  const [giveawayStatus, setGiveawayStatus] = useState(Status.NotStarted);
  const [giveawayEntryStatus, setGiveawayEntryStatus] = useState(Status.NotStarted);
  const [giveawayRemarks, setGiveawayRemarks] = useState('');
  const [giveawayData, setGiveawayData] = useState(null);

  const [isCheckingEntry, setIsCheckingEntry] = useState(true);
  const [isRegistered, setIsRegistered] = useState(false);
  const [shopperData, setShopperData] = useState(null);

  const [intervalTriggered, setIntervalTriggered] = useState(false);

  const { GIVEAWAY_TERMS_URL } = Config;

  const navigateBack = () => {
    props.navigation.goBack();
    return false;
  };

  const determineEntryStatus = ({ startTime, endTime }) => {
    const currentDate = new Date();
    const startDate = new Date();
    const endDate = new Date();
    const startSplit = startTime.split(':');
    const endSplit = endTime.split(':');

    const currentDateStart = startDate.setHours(startSplit[0], startSplit[1], 0);
    const currentDateEnd = endDate.setHours(endSplit[0], endSplit[1], 0);

    const startDiff = Date.parse(currentDate) - currentDateStart;
    const endDiff = Date.parse(currentDate) - currentDateEnd;

    let status = '';
    if (startDiff < 0) {
      status = Status.NotStarted;
    } else if (endDiff > 0) {
      status = Status.Ended;
    } else {
      status = Status.Running;
    }
    return status;
  };

  const getGiveawayEvent = async () => {
    try {
      const giveawayInfo = await apiServiceV2.getGiveawayEventStatus(ShopperService.getLoginToken());
      if (!IsEmpty(giveawayInfo)) {
        const { status, info, remarks } = giveawayInfo;
        setGiveawayData(info);
        setGiveawayStatus(status);
        setGiveawayRemarks(remarks);

        if (info?.entryWindow) {
          const entryStatus = determineEntryStatus({ startTime: info.entryWindow?.startTime, endTime: info.entryWindow?.endTime });
          setGiveawayEntryStatus(entryStatus);
        }
      }

      await Sleep(500);
      setIsLoading(false);
    } catch (error) {
      setIsLoading(false);
      console.log('getGiveAwayEvent Error: ', error);
      Alert.alert('', error.message);
    }
  };

  const getRegisterStatus = async () => {
    try {
      const getStatus  = await apiServiceV2.getShopperGiveawayRegistrationStatus(ShopperService.getLoginToken());
      setIsRegistered(getStatus.submitted);
      setIsCheckingEntry(false);
    } catch (error) {
      setIsCheckingEntry(false);
      Alert.alert('', error.message);
    }
  };

  const getRegistrationInfoFromModal = (data) => {
    setIsRegistered(data);
  };

  const toggleRegistrationModalAndNavigate = (screen, { params }) => {
    props.navigation.navigate(`${screen}`, { ...params });
  };

  const goToLogin = () => {
    props.navigation.navigate(ScreenName.LoginScreen, { previous_screen: ScreenName.GiveawayInfoScreen });
  };

  const goToGiveawayTermsAndConditions = () => {
    props.navigation.navigate(ScreenName.WebScreen, { url: `${GIVEAWAY_TERMS_URL}?hideHeader=true`, title: Constants.GiveawayTerms });
  };

  const goToDailyWinner = () => {
    props.navigation.navigate(ScreenName.GiveAwayWinnerScreen, { previous_screen: ScreenName.GiveawayInfoScreen });
  };

  const goToGiveawayEntry = () => {
    props.navigation.navigate(
      ScreenName.GiveawayEntryScreen,
      {
        shopper:                shopperData,
        navigation:             props.navigation,
        registrationInfo:       getRegistrationInfoFromModal,
        termsConditionsClicked: goToGiveawayTermsAndConditions,
        toggleRegistrationModalAndNavigate,
      },
    );
  };

  useEffect(() => {
    if (props.shopperLoginStatus) {
      setShopperData(ShopperService.getLoggedInShopper());
      getGiveawayEvent();
      getRegisterStatus();
    }
  }, [props.shopperLoginStatus]);

  useEffect(() => {
    if (giveawayEntryStatus !== Status.Ended && !IsEmpty(giveawayData)) {
      // Check if entry status has changed
      const currentEntryStatus = determineEntryStatus({ startTime: giveawayData.entryWindow?.startTime, endTime: giveawayData.entryWindow?.endTime });
      console.log('currentEntryStatus=', currentEntryStatus);
      setGiveawayEntryStatus(currentEntryStatus);
    } else {
      console.log('giveawayEntryStatus=', giveawayEntryStatus);
      console.log('giveawayData=', giveawayData);
    }
  }, [intervalTriggered]);

  useEffect(() => {
    const entryBtnChangeInterval = setInterval(() => {
      // *Note: We cannot access the state value updated within interval, but we can trigger state changes,
      // so, we trigger a state change and that state's useEffect will update the entry status
      setIntervalTriggered((value) => !value);
    }, 5000);

    function unmountFunc() {
      try {
        console.log('Unmount func called');
        if (entryBtnChangeInterval) {
          clearInterval(entryBtnChangeInterval);
          console.log('EntryBtnChangeInterval cleared');
        }
      } catch (error) {
        console.log('Error in giveawayInfoScreen unmount: ', error);
      }
    }

    return unmountFunc;
  }, []);

  const WebDisplay = React.memo(({ html }) => (
    <RenderHtml
      contentWidth={screenWt}
      tagsStyles={{
        body: {
          fontSize: font.scale38,
        },
        ul: {
          marginTop:    0,
          marginBottom: 0,
        },
        li: {
          marginBottom: 0,
          marginTop:    0,
        },
      }}
      source={{ html }}
    />
  ));

  return (
    <>
      <ScrollView
        overScrollMode="never" // improves UI fps on Android 12. No 'stretch' effect on the card on pull.
      >
        <View style={{ height: 'auto', backgroundColor: Colours.White }}>
          <View style={{ width: screenWt, marginTop: getStatusBarHeight() + dim.fixed55, alignItems: 'center' }}>
            <Image
              source={Images.Local.GiveawayLogo}
              style={{
                width:  dim.scale500,
                height: (dim.scale500 / 1865) * 649,
              }}
              resizeMode="cover"
            />
          </View>

          <Image
            source={Images.Local.GiveawayPoster}
            style={{
              resizeMode: 'contain',
              width:      screenWt,
              height:     (screenWt / 1144) * 469,
            }}
          />

          {
            (isLoading || IsEmpty(giveawayData) || giveawayStatus === Status.NotStarted) ? (
              <View style={{ marginTop: dim.scale120, paddingBottom: dim.scale200 }}>
                {
                  isLoading
                    ? <LoadingIndicator colour={Colours.Red} />
                    : (
                      <View style={{ flex: 1, alignItems: 'center', paddingHorizontal: dim.fixed115 }}>
                        {
                          giveawayStatus === Status.NotStarted
                            ? <MText text={!IsEmpty(giveawayRemarks) ? `${giveawayRemarks}` : 'Coming soon!'} textSize={font.scale50} bold />
                            : <MText text={`Monstyr app could not connect to server.\n\nPlease ensure you have internet access and try again.`} bold />
                        }
                      </View>
                    )
                }
              </View>
            ) : (
              <>
                <View style={{ marginTop: dim.fixed30, alignContent: 'center', alignItems: 'center' }}>
                  <Icons.GiveawayIcon style={{ marginVertical: dim.fixed15 }} size={dim.fixed115} />

                  <MText text="Total Prizes" color={Colours.LightGray} textSize={font.scale36} bold style={{ marginTop: dim.fixed15 }} />
                  <MText text={`${!IsEmpty(giveawayData) ? giveawayData.totalGiveaway : ''}*`} bold textSize={font.scale60} style={{ marginTop: 0 }} />

                  <View style={{ flexDirection: 'row' }}>
                    <MText
                      text={`(1 x ${!IsEmpty(giveawayData.dailyGiveaway) ? giveawayData.dailyGiveaway.prize : ''} `}
                      textSize={font.scale38}
                      bold
                    />
                    <MText
                      text="to be given away daily "
                      textSize={font.scale38}
                    />
                  </View>
                  <View style={{ flexDirection: 'row' }}>
                    <MText
                      text="for "
                      textSize={font.scale38}
                    />
                    <MText
                      text={`${!IsEmpty(giveawayData.dailyGiveaway) ? giveawayData.dailyGiveaway.numOfDays : ''} days!)`}
                      textSize={font.scale38}
                      bold
                    />
                  </View>
                </View>

                <View style={{ marginHorizontal: dim.fixed75, marginTop: dim.fixed50 }}>
                  <View style={{
                    backgroundColor:   Colours.Gold,
                    paddingVertical:   dim.fixed30,
                    paddingBottom:     dim.fixed40,
                    paddingHorizontal: dim.fixed35,
                    justifyContent:    'space-evenly',
                    alignSelf:         'center',
                    borderRadius:      dim.fixed40,
                  }}
                  >
                    <MText style={{}} color={Colours.White} text="Giveaway Period: " textSize={font.scale36} bold />
                    <MText style={{}} text={`${!IsEmpty(giveawayData.period) ? giveawayData.period : 'period'}`} textSize={font.scale38} underline />

                    <MText style={{ marginTop: dim.fixed35 }} color={Colours.White} text="Announcement of Daily Winner: " textSize={font.scale36} bold />
                    <MText style={{}} text={`${giveawayData.winnerAccouncement}`} textSize={font.scale38} />

                    <MText style={{ marginTop: dim.fixed30, marginBottom: dim.fixed10 }} color={Colours.White} text="How It Works: " textSize={font.scale36} bold />
                    <WebDisplay html={!IsEmpty(giveawayData.howItWorks) ? giveawayData.howItWorks : '<ul></ul>'} />

                    <MText style={{ marginTop: dim.fixed30 }} color={Colours.White} text="Terms and Conditions: " textSize={font.scale36} bold />
                    <TouchableOpacity onPress={goToGiveawayTermsAndConditions}>
                      <MText style={{}} text="Tap to read" underline textSize={font.scale38} />
                    </TouchableOpacity>
                  </View>
                </View>

                <View style={{ paddingHorizontal: dim.scale80, flexDirection: 'row', justifyContent: 'space-evenly', marginTop: dim.fixed40, marginBottom: dim.scale60, alignItems: 'center', alignContent: 'center' }}>
                  <MButton
                    icon={isCheckingEntry ? LoadingIndicator : null}
                    iconStyle={{ justifyContent: 'center' }}
                    text={
                      isRegistered
                        ? 'Already Registered For Today'
                        : (giveawayEntryStatus === Status.Running)
                          ? `Entry For Today’s \nMonstyr Giveaway`
                          : (giveawayEntryStatus === Status.NotStarted)
                            ? 'Entry Not Open Yet'
                            : 'Entry Closed'
                    }
                    textBold
                    disabled={isCheckingEntry || isRegistered || giveawayEntryStatus !== Status.Running} //comment out to test the modal display
                    textSize={font.scale34}
                    textStyle={{ color: Colours.White, textAlign: 'center' }}
                    style={{
                      ...btnStyle.goldButton,
                      backgroundColor: (giveawayEntryStatus === Status.Running && !isRegistered) ? Colours.Gold : Colours.LightGray4,
                      marginRight:     dim.fixed50,
                      flex:            1,
                    }}
                    onPress={goToGiveawayEntry}
                  />

                  <MButton
                    text="See Daily Winners"
                    textBold
                    textSize={font.scale34}
                    textStyle={{ color: Colours.White, textAlign: 'center' }}
                    style={{ ...btnStyle.goldButton, backgroundColor: Colours.Red, flex: 1 }}
                    onPress={goToDailyWinner}
                  />
                </View>
              </>
            )
          }

          <View style={{ position: 'absolute', top: getStatusBarHeight() + dim.fixed50, left: dim.fixed40, zIndex: 2 }}>
            <BackButton grayArrow onPress={() => { try { navigateBack(); } catch (err) { /** ignore */ } }} />
          </View>
        </View>
      </ScrollView>

      {
        !props.shopperLoginStatus && (
          <View style={[StyleSheet.absoluteFill, { zIndex: 2, backgroundColor: Colours.Tint }]}>
            <UALanding text="Monstyr Giveaway" goToLogin={goToLogin} />
          </View>
        )
      }
    </>
  );
};

GiveawayInfoScreen.propTypes = {
  navigation: PropTypes.shape({
    navigate: PropTypes.func.isRequired,
    goBack:   PropTypes.func.isRequired,
  }).isRequired,

  shopperLoginStatus: PropTypes.bool.isRequired,
};

const mapStateToProps = (state) => ({
  shopperLoginStatus: state.shopper.loginStatus,
});

export default connect(mapStateToProps)(GiveawayInfoScreen);
