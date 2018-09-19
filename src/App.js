import React, {Component} from 'react';
import {StyleSheet, View, Text,TouchableHighlight, ScrollView,TouchableOpacity,Image} from 'react-native';
import { Dropdown } from 'react-native-material-dropdown';
import MarqueeText from 'react-native-marquee';
export default class App extends Component{

constructor(props){
	super(props);
		this.state = {selectedChar:null,sortType:'ascending',openingCrawl: null, loading:false, heightSort: 0};
}

componentWillMount(){
	this.getMoviesFromApi()
	.then(response => {
		if(response){
			let lists = response.results.sort(function(a, b){
				return a.episode_id - b.episode_id
			})
			let movies = [];
			lists.map((val)=> movies.push({value: val.title,characters: val.characters, openingCrawl: val.opening_crawl}))
			this.setState({movies: movies})
		}
	})
}

animate () {
	this.animatedValue.setValue(0)
	Animated.timing(
	  this.animatedValue,
	  {
		toValue: 1,
		duration: 5000,
		easing: Easing.linear
	  }
	).start(() => this.animate())
}

getMoviesFromApi() {
	return fetch('https://swapi.co/api/films')
	.then((response) => response.json())
	.then((responseJson) => {
		return responseJson
	})
	.catch((error) => {
	 return console.error(error);
	});
}

getCharacters(val){
	let self = this;
	self.setState({openingCrawl:self.state.movies[val].openingCrawl,loading:true})
	Promise.all(self.state.movies[val].characters.map(url =>
		fetch(url).then(resp => resp.json())
	))
	.then(json => self.setState({selectedChar:json,loading: false,selectedCharRef:json}))
}
getGender(gender){
	if(gender.toLowerCase() == 'male'){
		return 'M';
	}else if(gender.toLowerCase() == 'female'){
		return 'F';
	}else{
		return 'N/A';
	}
}
renderRow(data,i) {
	return (
		<View key={i} style={styles.head}>
			<View style={[styles.rowLine,{width:'55%'}]} ><Text style={{color:'#000'}}>{data.name}</Text></View>
			<View style={[styles.rowLine,{width:'25%'}]} ><Text style={{color:'#000'}}>{this.getGender(data.gender)}</Text></View>
			<View style={styles.rowLine2} ><Text style={{color:'#000'}}>{data.height}</Text></View>
		</View>
	);
}

sortData(type){
	let sorted, self = this, sortType = (this.state.sortType == 'ascending') ? 'descending' : 'ascending' ;
	let count = this.state.heightSort;
	if(type != 'gender'){
		sorted = self.state.selectedChar.sort(function(a, b){
			if(type == 'height'){
				return sortType == 'ascending' ?  a.height - b.height : b.height - a.height
			}else{
				var nameA=a[type].toLowerCase(), nameB=b[type].toLowerCase()
				if ( nameA < nameB) {
					let val = sortType == 'ascending' ? -1 : 1
					return val;
				}
				if (nameA > nameB) {
					let val = sortType == 'ascending' ? 1 : -1
					return val;
				}
				return 0;
			}
		})
	}else if( type == 'gender'){
		if(count == 0){
			sorted = self.state.selectedCharRef.filter(val=>val.gender == 'female');
		}else if(count == 1){
			sorted = self.state.selectedCharRef.filter(val=>val.gender == 'male');
		}else if(count == 2){
			sorted = self.state.selectedCharRef;
		}
		self.setState({heightSort: count == 2 ? 0 : count +1})
	}
	self.setState({selectedChar: sorted, sortType: sortType})
}

calculateHeight(){
	let total = 0, feet;
	this.state.selectedChar.map((val) => {
		let value = parseInt(val.height)
		if(typeof value == 'number'){
			total = value + total
		}
	});
	feet = total * 0.0328084
	return feet;
}

  render() {
    return (
		<View style={styles.container}>
			<View style={{flex:0.4,paddingTop:20}}>
			{
				this.state.movies ? 
				<View style={{width:'80%',alignSelf:'center'}}>
					<Dropdown
						label='Select Movies'
						data={this.state.movies}
						onChangeText={(value, index, data)=>this.getCharacters(index)}
						contentContainerStyle={{width:'90%',backgroundColor:'#ffff0059'}}
						dropdownPosition={0}
					/>
				</View> 
				: loading
			}
			{
				this.state.openingCrawl ?
				<MarqueeText
          style={{ fontSize: 18 }}
          duration={20000}
          marqueeOnStart
          loop
          marqueeDelay={2000}
          marqueeResetDelay={1000}
        >
	{	console.log(this.state.openingCrawl.replace(/(\r\n\t|\n|\r\t)/gm,""))}
          {this.state.openingCrawl.replace(/(\r\n\t|\n|\r\t)/gm,"")}
        </MarqueeText>
				:
				null
			}
			</View>
			{
				this.state.selectedChar && !this.state.loading ?
				<View style={{flex:1,  alignSelf: 'center', justifyContent: 'center',borderColor:'black',borderWidth:1,width:'90%' }}>
				<View style={{  alignSelf: 'stretch', flexDirection: 'row',borderBottomColor:'black',borderBottomWidth:1,width:'100%' }}>
					<TouchableOpacity onPress={()=>this.sortData('name')} style={[styles.rowLine,{width:'55%'}]}><Text style={{color:'skyblue'}}>Name</Text></TouchableOpacity>
					<TouchableOpacity onPress={()=>this.sortData('gender')} style={[styles.rowLine,{width:'25%'}]} ><Text style={{color:'skyblue'}}>Gender</Text></TouchableOpacity>
					<TouchableOpacity onPress={()=>this.sortData('height')} style={styles.rowLine2} ><Text style={{color:'skyblue'}}>Height</Text></TouchableOpacity>
				</View>
				<ScrollView contentContainerStyle={{alignSelf:'center'}} style={{flex:0.8}}>
			{
				this.state.selectedChar.map((datum,i) => {
					return this.renderRow(datum,i);
				})
			}
			</ScrollView>
			<View style={{  alignSelf: 'stretch', flexDirection: 'row',borderBottomColor:'black',borderBottomWidth:1,width:'100%' }}>
					<View style={[styles.rowLine,{width:'55%',justifyContent:'center'}]}><Text style={{color:'skyblue'}}>Total characters: </Text><Text>{this.state.selectedChar.length}</Text></View>
					<View  style={[styles.rowLine2,{width:'45%',justifyContent:'center'}]} ><Text style={{color:'skyblue'}}>Total Height: </Text><Text>{this.calculateHeight()}</Text></View>
			</View>
			</View> 
			:
				this.state.loading ? 
				loading
				:
				<Image resizeMode='contain' style={styles.image} source={require('../star_wars.png')}/>
			}
		</View>
    );
  }
}

const loading = <View style={{height:40,backgroundColor:'yellow',justifyContent:'center'}}><Text style={{alignSelf:'center',color:'#000'}}>Loading . . .</Text></View>

const styles = StyleSheet.create({
	container: {
		flex: 1,
		backgroundColor:'#fff'
	},
	rowLine:{
		alignSelf: 'stretch',
		borderRightWidth:1,
		borderRightColor:'black',
		alignItems:'center',
		paddingBottom:20,
		paddingTop:20 
	},
	rowLine2:{
		alignSelf: 'stretch',
		alignItems:'center',
		width:'20%',
		paddingBottom:20,
		paddingTop:20 
	},
	head:{
		flex: 1,
		alignSelf: 'stretch',
		flexDirection: 'row',
		borderBottomColor:'black',
		borderBottomWidth:1,
		width:'100%' 
	},
	image:{
		width:'100%',
		height:300,
		justifyContent:'flex-end'
	}
});