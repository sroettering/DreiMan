import './Game.html';
import './Game.css';

import { Meteor } from 'meteor/meteor';
import { Template } from 'meteor/templating';
import { ReactiveDict } from 'meteor/reactive-dict';

Template.Game.onCreated(function() {
  let template = Template.instance();

  template.images = [];
  for(let i = 0; i < 6; i++) {
    template.images.push('/images/dice/Dice-'+(i+1)+'.svg');
  }

  template.diceRoll = new ReactiveDict({
    first: -1,
    second: -1
  });

});

Template.Game.onRendered(function() {
  let template = Template.instance();
  let room = template.data.room;

  template.setPosition = function(player, x, y) {
    var xoffset = player.offsetWidth / 2;
    var yoffset = player.offsetHeight / 2;
    player.style.left = (x - xoffset) + 'px';
    player.style.top = (y - yoffset) + 'px';
  };

  template.positionPlayers = function() {
    const dAlpha = Math.PI * 2 / room.players.length;
    const tableWidth = template.find('.table').offsetWidth / 2;
    const tableHeight = template.find('.table').offsetHeight / 2;
    const radiusX = tableWidth - 20;
    const radiusY = tableHeight - 20;
    let angle = 0;
            x = 0,
            y = 0;

    for(let i = 0; i < room.players.length; i++) {
      let player = template.find('#player-'+i);
      const x = radiusX * Math.cos(angle) + tableWidth;
      const y = radiusY * Math.sin(angle) + tableHeight;
      template.setPosition(player, x, y);
      angle += dAlpha;
    }
  };

  template.positionPlayers();
  window.onresize = template.positionPlayers;
});

Template.Game.helpers({

});

Template.Game.events({
  'click #roll-button': function(event, template) {
    const d1 = Math.floor(Math.random() * 6) + 1;
    const d2 = Math.floor(Math.random() * 6) + 1;
    template.diceRoll.set({first: d1, second: d2});
    let die1 = template.find('#die-1');
    let die2 = template.find('#die-2');
    die1.src = template.images[d1-1];
    die2.src = template.images[d2-1];
  },
});
