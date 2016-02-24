function getRandom(num){var n=1000000000;function ugen(old,a,q,r,m){var t=Math.floor(old/q);
t=a*(old-(t*q))-(t*r);return Math.round((t<0)?(t+m):t);}var m1=2147483563,m2=2147483399,a1=40014,a2=40692,q1=53668,q2=52774,r1=12211,r2=3791,x=67108862;
var g2=(Math.round(((new Date()).getTime()%100000))&2147483647),g1=g2;var shuffle=[32],i=0;
for(;i<19;i++){g1=ugen(g1,a1,q1,r1,m1);}for(i=0;i<32;i++){g1=ugen(g1,a1,q1,r1,m1);
shuffle[31-i]=g1;}g1=ugen(g1,a1,q1,r1,m1);g2=ugen(g2,a2,q2,r2,m2);var s=Math.round((shuffle[Math.floor(shuffle[0]/x)]+g2)%m1);
var rand=Math.floor(s/(m1/(n+1)))/n;if(typeof(num)=="undefined"){return rand;}else{return Math.floor(rand*(num+1));
}}
var SR_url = window.location.toString().toLowerCase();
var _refv = escape(document.referrer);
var _rn = getRandom();


function loadCle(st, freq,_s,_l) {
		_freq = freq;	
		checkCle = cleCookie();
		if(checkCle) {
			if( document.cookie.indexOf('msresearch') == -1 && !(/^http(s)?\:\/\/windowsphone\.com/i.test(document.referrer)) ){ 
				if(_rn <= _freq){					
					if(st==1) {
						window.location.href = document.location.protocol +'//siterecruit.comscore.com/sr/windowsphone/int_cle.htm?location='+escape(window.location)+'&referrer='+_refv+'&frequency='+_freq+'&weight=100&site='+_s+'&H_SurveyType=1&l='+_l;
					}						
				}
		}
	}
}

function cleCookie() {
		if(document.cookie.indexOf('cleflag') == -1) {
			var c = 'cleflag=1; path=/; domain=.windowsphone.com';
			document.cookie = c;	
			return true;
		}
		else{
			return false;
		}
}

if(/[\w\.]+\/en-us\/celebrity\/gwen/i.test(SR_url)) {
	loadCle(1, 0.5,"2004","9");	
}else if(/[\w\.]+\/en-us\/celebrity\/jessica/i.test(SR_url)) {
	loadCle(1, 0.5,"2005","9");	
}else if(/[\w\.]+\/en-us\/celebrity\/andy/i.test(SR_url)) {
	loadCle(1, 0.5,"2006","9");
}else if(/[\w\.]+\/en-us\/celebrity\/cam/i.test(SR_url)) {
	loadCle(1, 0.5,"2007","9");	
}