module.exports = {
  servers: {
    one: {
      host: 'your.server.ip.or.name',
      username: 'username',
      // pem: './path/to/pem'
      password: 'password'
      // or neither for authenticate from ssh-agent
    }
  },

  app: {
    name: 'vixSimpleUIReact',
    path: '../',

    servers: {
      one: {},
    },

    buildOptions: {
      serverOnly: true,
    },

    env: {
      // If you are using ssl, it needs to start with https://
      ROOT_URL: 'http://server',
      MONGO_URL: 'mongodb://localhost/meteor',
      MAIL_URL: 'smtp://name:password@smtp.your.smtp.server:587',
    },

    // ssl: { // (optional)
    //   // Enables let's encrypt (optional)
    //   autogenerate: {
    //     email: 'email.address@domain.com',
    //     // comma separated list of domains
    //     domains: 'website.com,www.website.com'
    //   }
    // },

    docker: {
      // change to 'kadirahq/meteord' if your app is using Meteor 1.3 or older
      // for lower than Meteor 1.6 - image: 'abernix/meteord:base',
      image: 'abernix/meteord:node-8.9.3-base',  // Sat 06 Jan 18 'abernix/meteord:node-8.4.0-base',
    },

    // Show progress bar while uploading bundle to server
    // You might need to disable it on CI servers
    enableUploadProgressBar: true
  },

  mongo: {
    version: '3.4.1',
    servers: {
      one: {}
    }
  }
};
