<template>
	<div id="app">
		<section v-if="this.$route.path !== '/' && isTokenValid">
			<h1 class="title is-6">
				Internet Techies
			</h1>
			
			<h2 class="title is-1">
				Manage your Blog Posts
			</h2>
			
			<nav class="navbar is-light" role="navigation" aria-label="main navigation">
				<div class="container">
					<div class="navbar-menu is-active">
						<div class="navbar-start">
							
							<router-link :to="'/drafts'" class="navbar-item">Drafts</router-link>
							
							<router-link :to="'/pending'" class="navbar-item">Pending</router-link>
							
							<router-link :to="'/scheduled'" class="navbar-item">Scheduled</router-link>
							<button @click="logout()"> Logout </button>
						</div>
					</div>
				</div>	
			</nav>
		</section>
		
		<transition class="router-wrap" name="fade">
			<router-view :isLoggedIn.sync="isTokenValid"></router-view>
		</transition>
		<!--
		<button @click="generateToken()">Set cookie</button>
		<button @click="validate()">Validate token</button>
		<button @click="displayDrafts()">Display drafts</button>-->
		
	</div>
</template>

<script>
import { HTTP } from './environment';
import { WPAdmin } from './admin';
export default {
  name: 'app',
  data () {
    return {
	  isTokenValid: false,
    }
  },
  computed : {
	token: function(){
		return this.getCookie("wcmCookie");
	}
  },
  beforeMount: function () {
	this.checkToken();
  },
  beforeUpdate: function () {
	this.checkToken();
  },
  methods: {
	validate(){
		var vm = this;
		var token=this.getCookie("wcmCookie");
		if(token===undefined || token.length<=0){
			return false;
		}
		HTTP.post('/jwt-auth/v1/token/validate', {}, {
			headers: { "Authorization": 'Bearer' + token }
		})
		.then(function (response) {
			vm.isTokenValid = true;
			return true;
		})
		.catch(function (error) {
			vm.isTokenValid = false;
			return false;
		});
	},
	checkToken(){
		if(!this.isTokenValid){
			this.validate();
		}
	},
	logout(){
		this.setCookie("wcmCookie",'',0);
		this.$router.push({ name: 'Login'});
	},
	setCookie(cname, cvalue, exdays) {
		var d = new Date();
		d.setTime(d.getTime() + (exdays*24*60*60*1000));
		var expires = "expires="+ d.toUTCString();
		document.cookie = cname + "=" + cvalue + ";" + expires + ";path=/";
	},
	getCookie(cname) {
		var name = cname + "=";
		var decodedCookie = decodeURIComponent(document.cookie);
		var ca = decodedCookie.split(';');
		for(var i = 0; i <ca.length; i++) {
			var c = ca[i];
			while (c.charAt(0) == ' ') {
				c = c.substring(1);
			}
			if (c.indexOf(name) == 0) {
				return c.substring(name.length, c.length);
			}
		}
		return "";
	}
  }
}
</script>

<style>
#app {
  font-family: 'PT Sans', sans-serif;
  -webkit-font-smoothing: antialiased;
  -moz-osx-font-smoothing: grayscale;
  text-align: center;
}

h1.title{
	margin-top: 60px;
}
h1, h2 {
  font-weight: normal;
}

ul {
  list-style-type: none;
  padding: 0;
}

li {
  display: inline-block;
  margin: 0 10px;
}

a {
  color: #0062C3;
}
.navbar-start{
	margin: 0 auto;
}
.router-link-active{
	font-weight: bold;
	background: #333;
	color: #fff !important;
}
</style>
