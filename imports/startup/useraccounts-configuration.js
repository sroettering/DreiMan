import { AccountsTemplates } from 'meteor/useraccounts:core';
import { FlowRouter } from 'meteor/kadira:flow-router';

AccountsTemplates.configure({
  showForgotPasswordLink: true,
  showLabels: false,
  focusFirstInput: false,
  forbidClientAccountCreation: false,
  onLogoutHook: function() {
    FlowRouter.go('home');
  },
  onSubmitHook: function() {
    FlowRouter.go('lobby');
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
