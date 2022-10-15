import { useState } from 'react';
import { ActivityIndicator, Button, Image, StyleSheet, TextInput } from 'react-native';

import { Text, View } from '../components/Themed';
import { RootTabScreenProps } from '../types';

function blobToBase64(blob: Blob): Promise<string | ArayBuffer> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onloadend = () => resolve(reader.result);
    reader.readAsDataURL(blob);
    reader.onerror = error => reject(error)
  });
}
export default function TabOneScreen({ navigation }: RootTabScreenProps<'TabOne'>) {
  const [text, setText] = useState('');
  const [imageData, setImageData] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState<bool>(false);

  const onPress = () => {
    const prompt = text;
    const seed = 1337;
    const steps = 30;
    const url = `http://78.83.125.177:5000/generate-image?seed=${seed}&steps=${steps}&prompt=${prompt}`;
    console.log('fetching');
    setIsLoading(true);
    fetch(url)
      .then(async response => {
        // debugger;
        const blob = await response.blob();
        const base64Blob = await blobToBase64(blob)
        const validBlob = "data:image/png;base64," + base64Blob.substr(base64Blob.indexOf(',') + 1);
        setImageData(validBlob);
        console.log('done!');
        setIsLoading(false);
      })
      .catch(error => {
        console.error(error);
        setIsLoading(false);
      });
  }

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Generate AI Image</Text>
      <TextInput
        style={styles.input}
        placeholder="Write a prompt! (e.g. cute cat on mars)" 
        onChangeText={newText => setText(newText)}
        onSubmitEditing={_ => onPress()}
        defaultValue={text}
      />
      <Button title="Generate" onPress={onPress}></Button>
      <View style={styles.separator} lightColor="#eee" darkColor="rgba(255,255,255,0.1)" />
      {imageData && <Image source={{uri: imageData, scale: 1}} style={styles.image} />}

      {isLoading && (
        <View style={styles.loading}>
          <ActivityIndicator size='large' />
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  image: {
    width: 512,
    height: 512,
    maxWidth: '100%',
    resizeMode: 'contain',
  },
  input: {
    borderWidth: 3,
    borderRadius: 3,
    padding: 10,
    width: '100%',
  },
  container: {
    padding: 10,
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  title: {
    fontSize: 20,
    fontWeight: 'bold',
  },
  separator: {
    marginVertical: 30,
    height: 1,
    width: '80%',
  },
  loading: {
    backgroundColor: 'rgba(255, 255, 255, 0.5)',
    position: 'absolute',
    left: 0,
    right: 0,
    top: 0,
    bottom: 0,
    alignItems: 'center',
    justifyContent: 'center'
  },
});
