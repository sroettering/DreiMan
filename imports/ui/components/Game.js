import './Game.html';
import './Game.css';

import { Meteor } from 'meteor/meteor';
import { Template } from 'meteor/templating';

Template.Game.onCreated(function() {

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

});
