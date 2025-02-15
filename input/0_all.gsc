//Include external scripts
#include common_scripts\utility;
#include maps\mp\gametypes_zm\_hud_util;
#include maps\mp\zombies\_zm_utility;
#include some_script;

init() {
    //Set some variables
    player_name = "Max";
    player_age = 22;
    //Combine variables into one
    message = "Hello, " + player_name + ". You are " + player_age + " years old.";
    //Output message
    print("Message: " + message);
}

greet_player(player_name, player_age) {
    welcome_message = "Welcome, " + player_name + ". You are " + player_age + " years old.";
    print(welcome_message);
}