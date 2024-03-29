import { database, auth } from './Database'
import { addItem, saveItem, saveItemInfo } from './database_functions/ItemData'
import React, { useState, useEffect, useCallback } from 'react';
import { Text, View, KeyboardAvoidingView, Keyboard } from 'react-native';
import { useFocusEffect, useTheme } from '@react-navigation/native';
import { ref, get } from "firebase/database";
import { styles } from './Styles';
import { StyledInput } from './components/StyledInput';
import { updateInvalidInputsList } from './functions/updateInvalidInputsList';
import { SolidButton } from './components/SolidButton';
import { Divider } from 'react-native-elements';

// Insert specified amount of specific item to your inventory
export const AddItem = ({ navigation, route }) => {
    const [item, setItem] = useState({...route.params?.item, barcode: route.params?.barcode ?? null})
    const [inventory, setInventory] = useState({...route.params?.inventory})
    const [doInputValueCheck, setDoInputValueCheck] = useState(false)
    const [keyboardStatus, setKeyboardStatus] = useState(false);
    const [error, setError] = useState('')
    let invalidInputsList = []
    const colors = useTheme().colors;

    useEffect(() => {
      const showSubscription = Keyboard.addListener("keyboardDidShow", () => {
          setKeyboardStatus(true);
      });
      const hideSubscription = Keyboard.addListener("keyboardDidHide", () => {
          setKeyboardStatus(false);
      });
  
      return () => {
          showSubscription.remove();
          hideSubscription.remove();
      };
    }, []);

    useEffect(() => {
      if(doInputValueCheck && !invalidInputsList.length > 0) {
        submit()
      }
    }, [doInputValueCheck])

    // Function called by Styled Input
    const handleInvalidValue = (inputName, valueIsInvalid) => {
      invalidInputsList =
        updateInvalidInputsList(
          invalidInputsList, inputName, valueIsInvalid
        ) 
    }

    const submit = () => {
      setError('')
      let errMsg
      
      // Add new item
      if(!route.params.edit) {
        addItem(inventory, item)
        .catch(e => errMsg = "Error while adding item (" + e.code + ")")

      // Edit already existing item
      } else {
        saveItem(inventory, item)
        .catch(e => errMsg = "Error while editing item (" + e.code + ")")
        saveItemInfo(item)
        .catch(e => errMsg = "Error while editing item (" + e.code + ")")
      }

      if(!errMsg) {
        navigation.navigate('Item List', {
          inventory: inventory,
          item: item
        })
      } else setError(errMsg)
    }

    return(
        <>
        <KeyboardAvoidingView style={[{flex:1, alignItems:"center", backgroundColor:colors.background, padding: 10}]}>
          <View style={{flex:1}}>
            <View style={{height:"100%", justifyContent:"center"}}>
              {/* Main container */}
              <View style={[{width:"100%",flexDirection:"row",alignItems:"center", backgroundColor:colors.card, borderRadius:5, padding:20, marginTop: keyboardStatus ? -45 : null}]}>
                <View style={{width:"100%"}}>
                  <Text onPress={() => console.log(auth.currentUser.uid)} style={{color:colors.primary3, fontSize:22, fontWeight:"bold", display: keyboardStatus ? "none" : null}}>Item details</Text>
                  <Divider color={colors.reverse.card} style={{marginVertical:10}} />
                  <View>
                    {/* Form */}
                    <StyledInput
                      label="Name"
                      matchType="text"
                      checkValue={doInputValueCheck}
                      handleInvalidValue={handleInvalidValue}
                      onChangeText={name => {setItem({...item, name: name}); setError('')}}
                      value={item.name}
                      placeholder="Name for item"
                      icon="tag"
                      inputContainerStyle={{margin: keyboardStatus ? -10 : null}}
                    />

                    <StyledInput
                      label="Description"
                      keyboardStatus={keyboardStatus}
                      checkValue={doInputValueCheck}
                      handleInvalidValue={handleInvalidValue}
                      onChangeText={description => {setItem({...item, description: description}); setError('')}} 
                      value={item.description}
                      placeholder="Item description"
                      icon="quote-right"
                      inputContainerStyle={{margin: keyboardStatus ? -10 : null}}
                    />

                    <StyledInput
                      label="Amount"
                      keyboardStatus={keyboardStatus}
                      checkValue={doInputValueCheck}
                      handleInvalidValue={handleInvalidValue}
                      matchType="number"
                      keyboardType="numeric" 
                      onChangeText={amount => {setItem({...item, amount: amount}); setError('')}} 
                      value={item.amount}
                      placeholder="Amount"
                      icon="cubes"
                      inputContainerStyle={{marginBottom:-10, margin: keyboardStatus ? -10 : null}}
                    />
                  </View>
                </View>
              </View>
            </View>
          </View>
          {/* Footer */}
          <View style={[{width:"100%", alignItems:"center", position:"absolute", bottom:0}]}>
            {/* Save button */}
            <View style={{alignItems:"center", marginVertical: keyboardStatus ? 0 : 20, width: "90%"}}>
              <View style={{flexDirection:"row"}}>
                {!route.params.edit  &&
                  <SolidButton
                    color="warning"
                    style={{width:"50%", marginRight: 5}}
                    onPress={() => 
                      navigation.navigate('Barcode Scanner', {
                        inventory: inventory,
                        item: item
                      }
                    )} 
                    title="Scan barcode"
                    icon="camera"
                  />
                } 
                <SolidButton
                  style={{width:"50%", marginLeft: 5}}
                  onPress={() => setDoInputValueCheck(doInputValueCheck + 1)} 
                  title={route.params.edit ? "Save" : "Add item"}
                  icon={route.params.edit ? "check" : "plus"}
                />
              </View>
            </View>
          </View>
        </KeyboardAvoidingView>
        </>
    )
}