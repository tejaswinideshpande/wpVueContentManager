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
							<a :href="props.row.post.editurl" title="Edit Post" target="_blank" class="post-title">{{ props.row.post.title }}</a> <a class="button is-small" target="_blank" title="Preview the post" :href="props.row.post.preview">Preview</a>
						</b-table-column>
						
						<b-table-column field="post.publishAt" label="Scheduled for" sortable>
							{{ props.row.post.publishAt }}
						</b-table-column>
						
						<b-table-column field="post.author" label="Author" sortable>
							{{ props.row.post.author }}
						</b-table-column>
						
					</template>
					
				</b-table>
			</section>
			<hr />
			<section class="content is-small"><p class="title is-4 is-spaced">Total Scheduled Posts: {{tableData.length}}</p></section>
			
		</div>
		<a class="button is-danger login-redirect" v-if="!isLoggedIn && m" @click="loginRedirect">Login to proceed!</a>
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
			i: 0,
		}
	},
	props: ['isLoggedIn'],
	mounted: function(){
		var vm = this;
		setTimeout(function(){
			vm.m = true;
		},3000);
		this.displayScheduledPosts();
	},
	methods: {
		loginRedirect(){
			this.$router.push({name : 'Login', params: { redirectTo: 'scheduled' }});
		},
		validate(){
			var vm = this;
			return new Promise(function(resolve, reject) {
				var token=vm.wpcmGetCookie("wcmCookie");
				if(token===undefined || token.length<=0){
					return false;
				}
				HTTP.post('/jwt-auth/v1/token/validate', {}, {
					headers: { "Authorization": 'Bearer' + token }
				})
				.then(function (response) {
					resolve(token);
				})
				.catch(function (error) {
					reject(Error('Cannot validate token!'));;
				});
			});
		},
		displayScheduledPosts(){
			var token=this.wpcmGetCookie("wcmCookie");
			if(token===undefined || token.length<=0){
				vm.$router.push({ name: 'Login'});
			}
			loadingSpinner.init(true);

			var vm = this;
			this.validate().then(function(token){
				HTTP.get('/wppbs/v1/scheduled', {
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
								"publishAt": post.publish_at,
								"preview": post.preview,
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
	}
}
</script>

<style scoped>
.login-redirect{
	margin-top:7em;
}
.b-table{
	width: 70%;
	max-width: 760px;
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