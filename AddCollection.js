import { database, auth } from './Database'
import { addCollection, editCollection, removeCollection } from './database_functions/CollectionData';
import { changeUserData } from './database_functions/UserData'
import React, { useState, useEffect } from 'react';
import { StyleSheet, Text, View, KeyboardAvoidingView } from 'react-native';
import { useTheme, useFocusEffect } from '@react-navigation/native';
import { increment } from "firebase/database";
import { ColorPicker } from './components/ColorPicker';
import { SolidButton } from './components/SolidButton';
import { StyledInput } from './components/StyledInput';
import { updateInvalidInputsList } from './functions/updateInvalidInputsList';
import { Divider, Dialog, CheckBox } from 'react-native-elements';
import { styles } from './Styles';

export const AddCollection = ({ navigation, route }) => {
    const colors = useTheme().colors;
    const [values, setValues] = useState(route.params?.collection ?? {shared: false})
    const [error, setError] = useState('');
    const [visibleDialog, setVisibleDialog] = useState('');
    const [checkInputValues, setCheckInputValues] = useState(false);
    let invalidInputsList = [];

    const add = () => {
        setError('')
        addCollection(values.name, values)
        .then(result => {
            changeUserData({collectionsCreated: increment(1)})
            .catch(e => console.log("Increment failed: " + (e.code)))
            
            navigation.navigate('Collections', {
              collection: {...values}
            })
        })
        .catch(e => setError(`Error (${e})`))
    }

    const edit = () => {
      setError('')
      editCollection(route.params.collection.name, values)
      .then(result => {
        navigation.navigate('Collections', {
          collection: {...values}
        })
      })
      .catch(e => setError(`Error (${e})`))
    }

    useEffect(() => {
      if(checkInputValues) {
        if(values.edit)
          edit()
        else
          add()
      }
    }, [checkInputValues])

    // Function called by Styled Input
    const handleInvalidValue = (inputName, valueIsInvalid) => {
        invalidInputsList =
            updateInvalidInputsList(
                invalidInputsList, inputName, valueIsInvalid
            ) 
    }

    return(
      <>
      <KeyboardAvoidingView style={[{flex:1, alignItems:"center", backgroundColor:colors.background, padding: 10}]}>
        <View style={{flex:1}}>
          <View style={{height:"100%", justifyContent:"center"}}>
            {/* Main container */}
            <View style={[{width:"100%",flexDirection:"row",alignItems:"center", backgroundColor:colors.card, borderRadius:5, padding:20}]}>
              <View style={{width:"100%"}}>
              <Text onPress={()=> console.log(refs("collections").user.child) } style={{color:colors.primary3, fontSize:22, fontWeight:"bold"}}>Collection details</Text>
              <Divider color={colors.reverse.card} style={{marginVertical:10}} />
                <View>
                  <StyledInput
                    label="Collection name"
                    style={{width:50}}
                    matchType="text"
                    onChangeText={name => {setValues({...values, name: name}); setError('')}} 
                    value={values.name}
                    placeholder="Name for collection"
                    icon="tag"
                    iconColor={values.color === null ? colors.reverse.card : values.color}
                    checkValue={checkInputValues}
                    handleInvalidValue={handleInvalidValue}
                  />
                  <View style={{alignItems:"center"}}>
                    <ColorPicker
                      onColorChange={(color) => setValues({...values, color: color})}
                    />
                  </View>
                </View>
              </View>
            </View>
          </View>
        </View>
        {/* Footer */}
        <View style={[{width:"100%", alignItems:"center", position:"absolute", bottom:0}]}>
          {/* Save button */}
          <View style={{alignItems:"center", marginVertical: 20, width: "90%"}}>
            <Text style={styles.error}>{error}</Text>
            <View style={{flexDirection:"row"}}>
              {!!route.params?.edit === true &&
                <SolidButton
                  style={{width:"50%", marginRight: 5}}
                  onPress={() => setVisibleDialog("delete")} 
                  title="Delete collection"
                  color="error"
                  icon="trash"
                />
              }
              <CheckBox
                center
                title="Shared Collection"
                checked={values.shared}
                onPress={() => setValues({...values, shared: !values.shared})}
              />
              <SolidButton
                style={{width:"50%", marginLeft: 5}}
                onPress={() => setCheckInputValues(checkInputValues + 1)} 
                title="Confirm"
                icon="check"
              />
            </View>
          </View>
        </View>
      </KeyboardAvoidingView>
      <Dialog
        isVisible={visibleDialog === "delete" ? true : false}
        onBackdropPress={() => setVisibleDialog("")}
        overlayStyle={{backgroundColor: colors.card}}
      >
          <Dialog.Title titleStyle={{color: colors.text}} title="Confirm deletion" />
          <Text style={{color: colors.text}}>Are you sure you want 
            to delete collection {route.params?.collection.name}?
          </Text>
          <View style={{width:"100%"}}>
            <Dialog.Actions>
              <SolidButton
                style={{width: "30%", marginLeft:10}}
                title="Cancel"
                color="error"
                onPress={() => setVisibleDialog("")}
              />
              <SolidButton
                style={{width: "30%"}}
                title="Confirm"
                color="success"
                onPress={() => {
                  removeCollection(route.params.collection.name)
                  .then(res => navigation.navigate('Collections'))
                  .catch(e => setError(`Error (${e.code})`))
                }}
              />
            </Dialog.Actions>
          </View>
      </Dialog>
      </>
    )
}