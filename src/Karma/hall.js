import Bowl from "./bowl.js";
import Cat from "./cat.js";
import Coat from "./coat.js";
import Cup from "./cup.js";
import Lamp from "./lamp.js";
import Napkin from "./napkin.js";
import Player from "./player.js";
import Remote from "./remote.js";
import Snack from "./snack.js";

export default class Hall extends Phaser.Scene {
    constructor() {
        super({
            key: "hall"
        });
    }

    preload() {
        this.anime = this.sound.add('anime');

        let audioConfig = {
            mute: false,
            volume: 1,
            rate: 1,
            detune: 0,
            seek: 0,
            loop: false,
            delay: 0,
        };
        this.bowl = this.sound.add('bowl', audioConfig);
        this.coat = this.sound.add('coat', audioConfig);
        this.footstep = this.sound.add('footstep', audioConfig);
        this.hiss = this.sound.add('hiss', audioConfig);
        this.lamp = this.sound.add('lamp', audioConfig);
        this.remote = this.sound.add('remote', audioConfig);
        this.snack = this.sound.add('shake', audioConfig);
        this.swipe = this.sound.add('swipe', audioConfig);
        this.growl = this.sound.add('growl', audioConfig);
    }

    create() {
        this.add.image(0, 0, "hall").setOrigin(0, 0);
        this.cat = new Cat(this);
        this.cat.setScale(0.4);

        this.player = new Player(this);

        this.furniture = this.physics.add.staticGroup();
        this.furniture.add(this.add.rectangle(240, 200, 200, 400), true);
        this.furniture.add(this.add.rectangle(600, 80, 450, 100), true);
        this.furniture.add(this.add.rectangle(600, 400, 200, 100), true);
        this.furniture.add(this.add.rectangle(1100, 500, 300, 300), true);

        this.physics.add.collider(this.player, this.furniture);

        this.triggers = this.physics.add.staticGroup();
        this.triggers.add(new Lamp(this));
        this.triggers.add(new Snack(this));
        this.triggers.add(new Napkin(this));
        this.triggers.add(new Cup(this));
        this.triggers.add(new Remote(this));
        this.triggers.add(new Coat(this));
        this.triggers.add(new Bowl(this));

        this.physics.add.overlap(this.player, this.triggers, (o1, o2) => {
            o2.overlap();
        });

        this.time.addEvent({
            delay: 200,
            callback: this.cat.sleep,
            callbackScope: this.cat,
            loop: true
        });

        //Cuando ordenemos hasta 5, ganamos
        this.tidy = 0;

        this.musicMarker = {
            name: "anime",
            start: 800,
            duration: 400
        };
        this.anime.addMarker(this.musicMarker)

        this.anime.play("anime");
        this.anime.setVolume(0.01);
    }

    update(t, dt) {
        if(this.tidy >= 5 && !this.cat.isAwake()) 
            this.scene.start("win");
    }

    taskCompleted(){
        this.tidy++;
    }
}