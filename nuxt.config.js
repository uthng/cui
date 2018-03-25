
module.exports = {
  /*
  ** Headers of the page
  */
  head: {
    title: 'cui',
    meta: [
      { charset: 'utf-8' },
      { name: 'viewport', content: 'width=device-width, initial-scale=1' },
      { hid: 'description', name: 'description', content: 'Consul Web UI' }
    ],
    link: [
      { rel: 'icon', type: 'image/x-icon', href: '/favicon.ico' },
      { rel: 'stylesheet', href: 'https://fonts.googleapis.com/css?family=Roboto:300,400,500,700|Material+Icons' }
    ]
  },
  plugins: ['~/plugins/vuetify.js', '~/plugins/vue-notifications.js'],
  css: [
    '~/assets/style/app.styl'
  ],
  /*
  ** Customize the progress bar color
  */
  loading: { color: '#3B8070' },
  /*
  ** Build configuration
  */
  axios: {
    proxyHeaders: false,
    credentials: false
  },
  build: {
    vendor: [
      '~/plugins/vuetify.js',
      'axios',
      'vue-notifications',
      'toastr'
    ],
    extractCSS: true
    /*
    ** Run ESLint on save
    */
    //extend (config, ctx) {
      //if (ctx.isDev && ctx.isClient) {
        //config.module.rules.push({
          //enforce: 'pre',
          //test: /\.(js|vue)$/,
          //loader: 'eslint-loader',
          //exclude: /(node_modules)/
        //})
      //}
    //}
  }
}
