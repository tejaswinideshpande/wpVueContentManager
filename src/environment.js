import axios from 'axios';

export const HTTP = axios.create({
  //Change this to your WP site's url
  baseURL: `http://localhost/test/wp-json`
})