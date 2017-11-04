<template>
	<section class="hero is-fullheight">
		<div class="hero-body">
		  <div class="container has-text-centered">
			<div class="column is-4 is-offset-4">
				<b-notification v-if="loginFail" type="is-danger">
					Login failed! Please check the credentials.
				</b-notification>
			  <h3 class="title has-text-grey">Login</h3>
			  <p class="subtitle has-text-grey">Please login to proceed.</p>
			  <div class="box">
				<figure class="avatar">
				  <img height="128" src="http://cache.clickonf5.org/wp-content/uploads/2017/02/logo1.png">
				</figure>
				<form>
				  <div class="field">
					<div class="control">
					  <input v-model="user" class="input is-large" type="text" placeholder="Username" autofocus="">
					</div>
				  </div>

				  <div class="field">
					<div class="control">
					  <input v-model="pass" class="input is-large" type="password" placeholder="Your Password">
					</div>
				  </div>
				  <a @click="login()" class="button is-block is-info is-large">Login</a>
				</form>
			  </div>
			</div>
		  </div>
		</div>
	</section>
</template>

<script>
import { HTTP } from './../environment';
export default{
data () {
    return {
	  isTokenValid: false,
	  loginFail: false,
	  user:'',
	  pass:'',
    }
  },
  computed : {
	token: function(){
		return this.getCookie("wcmCookie");
	}
  },
  methods: {
	login(){
		var vm = this;
		this.generateToken().then(function() {
			if( vm.$route.params.redirectTo !== undefined ){
				vm.$router.push(vm.$route.params.redirectTo);
			}
			else{
				vm.$router.push('drafts');
			}
		}, function() {
			vm.loginFail = true;
		});
	},
	generateToken(){
		var vm = this;
		return new Promise(function(resolve, reject) {
			HTTP.post('/jwt-auth/v1/token', {
				username: vm.user,
				password: vm.pass
			})
			.then(function (response) {
				vm.setCookie("wcmCookie",response.data.token,1);
				resolve('Token generated!');
			})
			.catch(function (error) {
				reject(Error('Cannot generate token!'));
			});
		});
	},
	validate(){
		var vm = this;
		//var token = this.getCookie("wcmCookie");
		HTTP.post('/jwt-auth/v1/token/validate', {}, {
			headers: { "Authorization": 'Bearer' + this.token }
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
</style>