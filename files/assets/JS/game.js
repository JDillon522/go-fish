$(document).ready(function() {
	var deck = $("#deck").playingCards(); //deck is our deck. I believe it needs to be put in a div, even if we're not displaying it
	deck.shuffle();
	var hand = [];

	$("#click").on('click', function() {
		$("#hand").html(""); //clear whatever is currently showing from the hand
		c = deck.draw();
		hand[hand.length] = c; //we probably could use .push() here but im so enamored with the hand.length thing
		for(var i=0;i<hand.length;i++) { //for every card in the hand
			$("#hand").append(hand[i].getHTML()); //show the card
		}
	});
});