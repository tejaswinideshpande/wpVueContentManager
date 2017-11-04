<template>
	<div class="container">
		<div v-if="isLoggedIn">
			<section>
				<b-table
					:data="tableData" 
					:default-sort-direction="asc"
					default-sort="post.author">
					
					<template slot-scope="props">
						<b-table-column field="post.title" label="Post Title" sortable>
							<a :href="props.row.post.editurl" title="Edit Post" target="_blank" class="post-title">{{ props.row.post.title }}</a>
						</b-table-column>
						
						<b-table-column field="post.author" label="Author" sortable>
							{{ props.row.post.author }}
						</b-table-column>
						
					</template>
					
				</b-table>
			</section>
			<hr />
			<section class="content is-small"><p class="title is-4 is-spaced">Total Drafts: {{tableData.length}}</p></section>
			
			<button class="button is-primary create-button" v-if="isCreateButton" @click="createDraftForm"> Create Draft </button>
			
			<form class="create-form" v-if="isCreate" @submit.prevent="createDraft">
				<h5 class="title is-5">Create new draft</h5>
				<div class="field">
					<div class="control">
						<input class="input" type="text" placeholder="Enter Post Title" v-model="title">
					</div>
				</div>
				<div class="field">
					<div class="control">
						<textarea class="textarea" placeholder="Enter Pointers/Summary" v-model="summary"></textarea>
					</div>
				</div>
				
				<div class="field">
					<div class="control">
						<select v-model="assignTo">
							<option disabled value="">Assign to</option>
							<option  
								v-for="option in authors"
								:value="option.id"
								:key="option.id">
								{{ option.display_name }}
							</option>
						</select>
					</div>
				</div>
				
				<input class="button is-dark" type="submit" value="Submit">
			</form>
			<b-notification v-if="createSuccessful" type="is-success" class="create-success">
				Draft added successfully!
			</b-notification>
		</div>
		
		<a class="button is-danger login-redirect" v-if="!isLoggedIn && m" @click="loginRedirect">Log in to proceed!</a>
		<a class="button is-warning login-redirect" v-else-if="!isLoggedIn" @click="loginRedirect">Authenticating...</a>
	</div>
</template>

<script>
import { HTTP } from './../environment';
import { WPAdmin } from './../admin';
export default{
	data(){
		return {
			m: false,
			/*tableData : [
				{"id": 1, "post": {"title": "My first Post"} },
				{"id": 2, "post": {"title": "Two ways to keep your dog fit"} },
			],*/
			tableData : [],
			authors: [],
			isCreate: false,
			isCreateButton: true,
			createSuccessful: false,
			title: '',
			summary: '',
			assignTo: '',
			i: 0,
		}
	},
	props: ['isLoggedIn'],
	mounted: function(){
		var vm = this;
		setTimeout(function(){
			vm.m = true;
		},3000);
		this.getAuthors();
		this.displayDrafts();
	},
	methods: {
		loginRedirect(){
			this.$router.push({name : 'Login', params: { redirectTo: 'drafts' }});
		},
		validate(){
			var vm = this;
			return new Promise(function(resolve, reject) {
				var token=vm.wpcmGetCookie("wcmCookie");
				if(token===undefined || token.length<=0){
					loadingSpinner.remove();
					return false;
				}
				HTTP.post('/jwt-auth/v1/token/validate', {}, {
					headers: { "Authorization": 'Bearer' + token }
				})
				.then(function (response) {
					resolve(token);
				})
				.catch(function (error) {
					loadingSpinner.remove();
					reject(Error('Cannot validate token!'));
				});
			});
		},
		getAuthors(){
			var token=this.wpcmGetCookie("wcmCookie");
			if(token===undefined || token.length<=0){
				vm.$router.push({ name: 'Login'});
			}
			var vm = this;
			this.validate().then(function(token){
				HTTP.get('/wppbs/v1/authors', {
					headers: { "Authorization": 'Bearer ' + token }
				})
				.then(function (response) {
					//console.log(response.data);
					var i=0;
					//console.log(response.data);
					response.data.forEach(function(author){
						vm.authors.push({
							"id": author.ID, 
							"username":author.user_login, 
							"display_name":author.display_name, 
						});
						//vm.authors.splice(author.ID, 0, author.user_login);
						i++;
					});
				})
				.catch(function (error) {
					console.log(error);
				});

			}).catch(function(error){
				console.log(error);
				vm.$router.push({ name: 'Login'});
			});
			
		},
		displayDrafts(){
			var token=this.wpcmGetCookie("wcmCookie");
			if(token===undefined || token.length<=0){
				vm.$router.push({ name: 'Login'});
			}
			loadingSpinner.init(true);

			var vm = this;
			this.validate().then(function(token){
				HTTP.get('/wppbs/v1/draft', {
					headers: { "Authorization": 'Bearer ' + token }
				})
				.then(function (response) {
					//console.log(response.data);
					response.data.forEach(function(post){
						vm.tableData.push({
							"id": vm.i, 
							"post":{
								"title": post.post_title,
								"author": post.post_author_name,
								"editurl": WPAdmin+'post.php?post='+post.ID+'&action=edit',
							} 
						});
						vm.i++;
						loadingSpinner.remove();
					});
				})
				.catch(function (error) {
					loadingSpinner.remove();
					console.log(error);
				});

			}).catch(function(error){
				loadingSpinner.remove();
				console.log(error);
				vm.$router.push({ name: 'Login'});
			});
			
		},
		createDraftForm(){
			this.isCreate = true;
			this.isCreateButton = false;
		},
		createDraft(){
			var token=this.wpcmGetCookie("wcmCookie");
			if(token===undefined || token.length<=0){
				vm.$router.push({ name: 'Login'});
			}
			loadingSpinner.init(true);
			var vm = this;
			this.validate().then(function(token){
				var postData = {
					"title": vm.title,
					"content": vm.summary,
					"author": vm.assignTo,
				};
				HTTP.post('/wppbs/v1/draft', postData, {
					headers: { "Authorization": 'Bearer ' + token }
				})
				.then(function (response) {
					loadingSpinner.remove();
					vm.tableData.push({
						"id": vm.i, 
						"post":{
							"title": response.data.post_title,
							"author": response.data.author_name,
							"editurl": WPAdmin+'post.php?post='+response.data.ID+'&action=edit'
						} 
					});
					vm.i++;
					vm.title=vm.summary=vm.assignTo='';
					vm.createSuccessful=true;
					vm.isCreateButton=true;
					vm.isCreate=false;
				})
				.catch(function (error) {
					loadingSpinner.remove();
					console.log(error);
				});
			}).catch(function(error){
				loadingSpinner.remove();
				console.log(error);
				vm.$router.push({ name: 'Login'});
			});
		},
	}
}
</script>

<style scoped>
.login-redirect{
	margin-top:7em;
}
.b-table{
	width: 60%;
	max-width: 640px;
	margin: 0 auto;
}
.post-title{
	font-weight: normal;
	font-size: 1.1em;
	font-family: 'Josefin Sans', sans-serif;
}
.create-form{
	text-align: left;
	width: 70%;
	max-width:540px;
	margin:3em auto;
}
.create-button{
	margin: 2em;
}
.create-success{
	text-align: center;
	width: 70%;
	max-width:540px;
	margin:3em auto;
}
</style>