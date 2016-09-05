import { AccountsTemplates } from 'meteor/useraccounts:core';
import { FlowRouter } from 'meteor/kadira:flow-router';
import { Meteor } from 'meteor/meteor';

if(Meteor.isServer){
  Meteor.users.before.insert(function(userId, doc) {
    if(!doc.username) {
      doc.username = "";
    }
    if(!doc.username && doc.profile && doc.services) {
      let username = doc.profile.name;
      if(doc.services.facebook) {
        username = doc.services.facebook.email;
      } else if(doc.services.google) {
        username = doc.services.google.email;
      } else if(doc.services.twitter) {
        username = doc.services.twitter.screenName;
      }
      console.log(username);
      doc.username = username;
    }
  });
}

AccountsTemplates.configure({
  showForgotPasswordLink: true,
  showLabels: false,
  focusFirstInput: false,
  forbidClientAccountCreation: false,
  onLogoutHook: function() {
    FlowRouter.go('home');
  },
  onSubmitHook: function() {
    FlowRouter.go('overview');
  },
  texts: {
    pwdLink_link: "Du hast dein Passwort vergessen?",
    signInLink_link: "Anmelden",
    signUpLink_link: "Registrier dich jetzt!",
    button: {
      signIn: "Anmelden",
      signUp: "Registrieren",
    },
  },
});

AccountsTemplates.removeField('email');
AccountsTemplates.addField({
  _id: 'username',
  type: 'text',
  required: true,
  placeholder: "Benutzername",
});

AccountsTemplates.removeField('password');
AccountsTemplates.addField({
    _id: 'password',
    type: 'password',
    required: true,
    placeholder: {
        default: "Passwort",
        signUp: "Passwort (mind. 6 Zeichen)",
    },
    minLength: 6,
    errStr: 'Mindestens 6 Zeichen',
});

AccountsTemplates.addField({
  _id: 'password_again',
  type: 'password',
  required: true,
  placeholder: {
    default: "Passwort wiederholen",
  }
});
