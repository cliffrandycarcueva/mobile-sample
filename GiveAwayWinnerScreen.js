import React, { useEffect, useState } from 'react';
import PropTypes from 'prop-types';
import { Alert, View, Image, FlatList } from 'react-native';
import { getStatusBarHeight } from 'react-native-status-bar-height';
import MText from '../../../components/basics/text';
import dim from '../../../common/dim';
import Colours from '../../../styles/Colours';
import Images from '../../../components/basics/Images';
import LoadingIndicator from '../../../components/basics/LoadingIndicator';
import font from '../../../common/font';
import apiServiceV2 from '../../../services/apiServiceV2';
import ShopperService from '../../../services/shopperService';
import { IsEmpty } from '../../../common/utils';
import BackButton from '../../../components/basics/backButton';
import { screenWt } from '../../../styles/defaultStyle';

const fontSize = font.scale38;

function GiveAwayWinnerScreen(props) {
  const [isLoading, setLoading] = useState(true);
  const [winnersData, setWinnersData] = useState(null);

  const getWinnersData =  async () => {
    try {
      setLoading(true);
      const data = await apiServiceV2.getGiveAwayWinners(ShopperService.getLoginToken());
      setWinnersData(data || []);
      setLoading(false);
    } catch (error) {
      setLoading(false);
      Alert.alert('', error.message);
    }
  };

  useEffect(() => {
    getWinnersData();
  }, []);

  const navigateBack = () => {
    props.navigation.goBack();
    return false;
  };

  const renderWinnerCards = () => {
    if (isLoading) {
      return <LoadingIndicator backgroundColor={Colours.Tint} />;
    } else {
      return (
        <View style={{  flex: 1 }}>
          <FlatList
            contentContainerStyle={{
              paddingBottom: dim.scale100,
            }}
            keyExtractor={(item, index) => index.toString()}
            data={winnersData}
            overScrollMode="never" // improves UI fps on Android 12. No 'stretch' effect on the card on pull.
            renderItem={({ item, index }) => (
              <View
                key={`${index}-item.name`}
                style={{
                  flexDirection:   'row',
                  paddingVertical: dim.fixed40,
                }}
              >
                <View
                  style={{
                    flex:           1.5,
                    flexDirection:  'row',
                    justifyContent: 'flex-start',
                    paddingRight:   dim.fixed30,
                  }}
                >
                  <MText
                    text={`${item.name}`}
                    textSize={fontSize}
                  />
                </View>
                <View
                  style={{
                    flex:           1,
                    flexDirection:  'row',
                    justifyContent: 'flex-start',
                  }}
                >
                  <MText
                    text={`${item.mobile}`}
                    textSize={fontSize}
                  />
                </View>
                <View
                  style={{
                    flex:           1,
                    flexDirection:  'row',
                    justifyContent: 'flex-start',
                  }}
                >
                  <MText
                    text={`${item.winDate}`}
                    textSize={fontSize}
                  />
                </View>
              </View>
            )}
            ItemSeparatorComponent={() => (
              <View
                style={{
                  height:          dim.fixed2,
                  width:           '100%',
                  backgroundColor: Colours.LightGray3,
                }}
              />
            )}
            style={{ marginTop: dim.scale10 }}
          />
        </View>
      );
    }
  };

  return (
    <View style={{ flex: 1, backgroundColor: Colours.White }}>
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

      <View
        style={{
          flex:            1,
          backgroundColor: Colours.White,
          marginTop:       dim.fixed30,
        }}
      >
        <View style={{ flexDirection: 'row', justifyContent: 'center' }}>
          <MText
            text="Daily Winners!"
            bold
            textSize={dim.scale60}
            color={Colours.Orange}
          />
        </View>

        <View style={{ flex: 1, marginTop: dim.fixed50, paddingLeft: dim.fixed50 }}>
          <View style={{ flexDirection: 'row', paddingBottom: dim.fixed20 }}>
            <View style={{ flex: 1.5, alignItems: 'flex-start' }}>
              <MText text="Name" textSize={fontSize} bold />
            </View>
            <View style={{ flex: 1, alignItems: 'flex-start' }}>
              <MText text="Mobile" textSize={fontSize} bold />
            </View>
            <View style={{ flex: 1, alignItems: 'flex-start' }}>
              <MText text="Entry Date" textSize={fontSize} bold />
            </View>
          </View>
          {
            !IsEmpty(winnersData) && renderWinnerCards()
          }
        </View>
      </View>

      <View style={{ position: 'absolute', top: getStatusBarHeight() + dim.fixed50, left: dim.fixed40, zIndex: 2 }}>
        <BackButton grayArrow onPress={() => { try { navigateBack(); } catch (err) { /** ignore */ } }} />
      </View>
    </View>
  );
}

GiveAwayWinnerScreen.propTypes = {
  navigation: PropTypes.shape({
    navigate: PropTypes.func.isRequired,
    goBack:   PropTypes.func.isRequired,
  }).isRequired,
};

export default GiveAwayWinnerScreen;
