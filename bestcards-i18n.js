/*
 * CardWiz — Best Cards content translations (Hinglish + Hindi).
 * --------------------------------------------------------------------
 * bestcards.js = English base. Yahan har card ke features/pros/cons/usefulFor
 * ke Hinglish + Hindi versions. Numbers, ₹/%/X, aur brand/technical terms
 * (HDFC, SmartBuy, Swiggy, forex, RP, NeuCoins...) jaise hain waise hi.
 *
 * Lookup: BEST_CARDS_I18N[cardId][lang][field]. Missing -> English (bestcards.js).
 * en: sirf usefulFor override (English); features/pros/cons bestcards.js se.
 * hinglish: features/pros/cons; usefulFor bestcards.js (already Hinglish).
 */

const BEST_CARDS_I18N = {
  'hdfc-infinia': {
    en: { usefulFor: 'High spenders (₹3L+/month) who travel and redeem points for flights/hotels.' },
    hinglish: {
      features: ['Almost har cheez pe 5 Reward Points / ₹150 (~3.3% value)', 'Unlimited domestic + international lounge access', 'SmartBuy se flights/hotels pe 10X points', 'Golf, concierge, low 2% forex markup'],
      pros: ['Best all-round premium rewards card', 'Unlimited lounges + badhiya redemptions', 'SmartBuy travel pe high value'],
      cons: ['Invite-only / high eligibility (₹3L+ salary ya HNW)', '₹12,500 + GST annual fee'],
    },
    hi: {
      features: ['लगभग हर खर्च पर 5 Reward Points / ₹150 (~3.3% वैल्यू)', 'अनलिमिटेड घरेलू + अंतरराष्ट्रीय लाउंज एक्सेस', 'SmartBuy से flights/hotels पर 10X पॉइंट्स', 'गोल्फ, कंसीयज, कम 2% forex मार्कअप'],
      pros: ['बेस्ट ऑल-राउंड प्रीमियम रिवॉर्ड कार्ड', 'अनलिमिटेड लाउंज + बढ़िया रिडेम्पशन', 'SmartBuy ट्रैवल पर हाई वैल्यू'],
      cons: ['इनवाइट-ओनली / हाई एलिजिबिलिटी (₹3L+ सैलरी या HNW)', '₹12,500 + GST सालाना फीस'],
      usefulFor: 'हाई स्पेंडर (₹3L+/महीना) जो ट्रैवल करते हैं और पॉइंट्स को flights/hotels में रिडीम करते हैं।',
    },
  },
  'axis-atlas': {
    en: { usefulFor: 'Frequent flyers who collect airline miles for business/award tickets.' },
    hinglish: {
      features: ['2-5 EDGE Miles / ₹100; travel pe accelerated', 'Miles airline/hotel partners mein transfer (high value)', 'Domestic + international lounge access', 'Annual spends pe milestone bonus miles'],
      pros: ['India ka best miles card travel ke liye', 'Strong airline transfer partners', 'Tiered benefits (Silver/Gold/Platinum)'],
      cons: ['Value tabhi jab miles transfer karke use karo', '₹5,000 annual fee'],
    },
    hi: {
      features: ['2-5 EDGE Miles / ₹100; ट्रैवल पर accelerated', 'Miles airline/hotel पार्टनर्स में ट्रांसफर (हाई वैल्यू)', 'घरेलू + अंतरराष्ट्रीय लाउंज एक्सेस', 'सालाना खर्च पर माइलस्टोन बोनस माइल्स'],
      pros: ['ट्रैवल के लिए India का बेस्ट माइल्स कार्ड', 'मज़बूत airline ट्रांसफर पार्टनर्स', 'Tiered बेनिफिट्स (Silver/Gold/Platinum)'],
      cons: ['वैल्यू तभी जब माइल्स ट्रांसफर करके यूज़ करो', '₹5,000 सालाना फीस'],
      usefulFor: 'फ्रीक्वेंट फ्लायर्स जो airline माइल्स इकट्ठा करके business/award टिकट लेते हैं।',
    },
  },
  'amex-platinum-charge': {
    en: { usefulFor: 'Affluent travellers who fully use hotel stays + lounges + concierge.' },
    hinglish: {
      features: ['Taj/Marriott/Hilton elite status + hotel benefits', 'Unlimited international + domestic lounges (Centurion/Priority Pass)', 'Concierge, fine-dining, milestone vouchers', 'Strong Membership Rewards earning'],
      pros: ['Ultra-premium lifestyle + travel perks', 'India mein best hotel status benefits', 'Excellent customer service'],
      cons: ['₹66,000 annual fee — sirf heavy users ke liye worth', 'Amex acceptance Visa/MC se kam'],
    },
    hi: {
      features: ['Taj/Marriott/Hilton elite status + hotel बेनिफिट्स', 'अनलिमिटेड अंतरराष्ट्रीय + घरेलू लाउंज (Centurion/Priority Pass)', 'कंसीयज, फाइन-डाइनिंग, माइलस्टोन वाउचर', 'मज़बूत Membership Rewards earning'],
      pros: ['अल्ट्रा-प्रीमियम लाइफस्टाइल + ट्रैवल perks', 'India में बेस्ट hotel status बेनिफिट्स', 'बेहतरीन कस्टमर सर्विस'],
      cons: ['₹66,000 सालाना फीस — सिर्फ़ heavy users के लिए worth', 'Amex acceptance Visa/MC से कम'],
      usefulFor: 'संपन्न ट्रैवलर्स जो hotel stays + लाउंज + कंसीयज का पूरा यूज़ करते हैं।',
    },
  },
  'hdfc-diners-black': {
    en: { usefulFor: 'High online + travel spenders who use SmartBuy and bundled memberships.' },
    hinglish: {
      features: ['5 RP / ₹150 (~3.3%) + SmartBuy se 10X', 'Unlimited lounge (self + add-on)', '6 complimentary memberships (Swiggy One, Times Prime, etc.)', 'Low forex, golf, concierge'],
      pros: ['Infinia-level rewards thodi easy eligibility pe', 'Bundled subscriptions se badi value', 'Badhiya SmartBuy redemptions'],
      cons: ['Diners network acceptance kam (offline)', '₹10,000 annual fee'],
    },
    hi: {
      features: ['5 RP / ₹150 (~3.3%) + SmartBuy से 10X', 'अनलिमिटेड लाउंज (self + add-on)', '6 कॉम्प्लिमेंट्री मेंबरशिप (Swiggy One, Times Prime, आदि)', 'Low forex, गोल्फ, कंसीयज'],
      pros: ['Infinia-लेवल रिवॉर्ड थोड़ी easy eligibility पर', 'Bundled subscriptions से बड़ी वैल्यू', 'बढ़िया SmartBuy रिडेम्पशन'],
      cons: ['Diners network acceptance कम (offline)', '₹10,000 सालाना फीस'],
      usefulFor: 'हाई online + ट्रैवल स्पेंडर जो SmartBuy और bundled मेंबरशिप यूज़ करते हैं।',
    },
  },
  'icici-emeralde-private-metal': {
    en: { usefulFor: 'Premium users wanting a wide-acceptance metal card + lounges + lifestyle perks.' },
    hinglish: {
      features: ['6 RP / ₹200 unlimited; strong redemption', 'Unlimited domestic + international lounges', 'Golf, BookMyShow, EazyDiner Prime, concierge', 'Low forex markup'],
      pros: ['Top-tier ICICI metal card', 'Wide acceptance (Mastercard/Visa)', 'Badhiya lifestyle + travel perks'],
      cons: ['₹12,499 annual fee', 'High eligibility'],
    },
    hi: {
      features: ['6 RP / ₹200 अनलिमिटेड; strong रिडेम्पशन', 'अनलिमिटेड घरेलू + अंतरराष्ट्रीय लाउंज', 'गोल्फ, BookMyShow, EazyDiner Prime, कंसीयज', 'Low forex मार्कअप'],
      pros: ['टॉप-टियर ICICI मेटल कार्ड', 'वाइड acceptance (Mastercard/Visa)', 'बढ़िया lifestyle + travel perks'],
      cons: ['₹12,499 सालाना फीस', 'हाई एलिजिबिलिटी'],
      usefulFor: 'प्रीमियम यूज़र जो wide-acceptance मेटल कार्ड + लाउंज + lifestyle perks चाहते हैं।',
    },
  },
  'sbi-cashback': {
    en: { usefulFor: 'Online shoppers — flat 5% on Amazon, Flipkart, Myntra, any site.' },
    hinglish: {
      features: ['Saare online spends pe 5% cashback (koi merchant restriction nahi)', '1% offline cashback', 'Auto-credited cashback (koi redemption nahi)', 'Monthly cap ₹5,000 cashback'],
      pros: ['India ka best flat online cashback card', 'Koi category juggling nahi — sab online pe 5%', 'Cashback seedha statement mein'],
      cons: ['₹999 annual fee (₹2L spend pe waiver)', 'Rent/wallet/fuel excluded'],
    },
    hi: {
      features: ['सारे online spends पर 5% कैशबैक (कोई merchant restriction नहीं)', '1% offline कैशबैक', 'ऑटो-क्रेडिटेड कैशबैक (कोई रिडेम्पशन नहीं)', 'मंथली कैप ₹5,000 कैशबैक'],
      pros: ['India का बेस्ट flat online कैशबैक कार्ड', 'कोई category juggling नहीं — सब online पर 5%', 'कैशबैक सीधे statement में'],
      cons: ['₹999 सालाना फीस (₹2L spend पर waiver)', 'Rent/wallet/fuel excluded'],
      usefulFor: 'Online shoppers — Amazon, Flipkart, Myntra, किसी भी साइट पर flat 5%।',
    },
  },
  'axis-ace': {
    en: { usefulFor: 'Bill payers + food orderers who want flat 2% everywhere.' },
    hinglish: {
      features: ['Google Pay bills/recharges pe 5% cashback', 'Swiggy/Zomato/Ola pe 4%', 'Baaki sab pe 2% flat cashback', 'Spends pe lounge access'],
      pros: ['Excellent 2% flat cashback', 'GPay se utility bills pe 5%', 'Low ₹499 fee (₹2L pe waiver)'],
      cons: ['5%/4% pe monthly caps', 'Top rate ke liye GPay zaroori'],
    },
    hi: {
      features: ['Google Pay bills/recharges पर 5% कैशबैक', 'Swiggy/Zomato/Ola पर 4%', 'बाकी सब पर 2% flat कैशबैक', 'Spends पर लाउंज एक्सेस'],
      pros: ['बेहतरीन 2% flat कैशबैक', 'GPay से utility bills पर 5%', 'Low ₹499 फीस (₹2L पर waiver)'],
      cons: ['5%/4% पर मंथली कैप', 'टॉप रेट के लिए GPay ज़रूरी'],
      usefulFor: 'बिल भरने वाले + फूड ऑर्डर करने वाले जो हर जगह flat 2% चाहते हैं।',
    },
  },
  'amazon-pay-icici': {
    en: { usefulFor: 'Amazon regulars + Prime members — no fee, 5% back.' },
    hinglish: {
      features: ['Amazon pe 5% (Prime) / 3% (non-Prime)', 'Amazon Pay partner merchants pe 2%', 'Baaki sab spends pe 1%', 'Lifetime free — koi annual fee nahi'],
      pros: ['Lifetime free + koi joining fee nahi', 'Heavy Amazon users ke liye best', 'Amazon Pay balance turant usable'],
      cons: ['Reward best sirf Amazon ecosystem mein', 'Amazon ke bahar low rate'],
    },
    hi: {
      features: ['Amazon पर 5% (Prime) / 3% (non-Prime)', 'Amazon Pay partner merchants पर 2%', 'बाकी सब spends पर 1%', 'Lifetime free — कोई annual fee नहीं'],
      pros: ['Lifetime free + कोई joining fee नहीं', 'हैवी Amazon users के लिए बेस्ट', 'Amazon Pay बैलेंस तुरंत usable'],
      cons: ['रिवॉर्ड बेस्ट सिर्फ़ Amazon ecosystem में', 'Amazon के बाहर low रेट'],
      usefulFor: 'Amazon regulars + Prime members — कोई फीस नहीं, 5% वापस।',
    },
  },
  'flipkart-axis': {
    en: { usefulFor: 'Flipkart/Myntra loyalists + Swiggy/Uber users.' },
    hinglish: {
      features: ['Flipkart / Myntra / Cleartrip pe 5%', 'Preferred partners (Swiggy, Uber, PVR, etc.) pe 4%', 'Baaki sab pe 1%', 'Spends pe lounge access'],
      pros: ['Flipkart + Myntra shoppers ke liye best', 'Strong 4% partner list', 'Low ₹500 fee'],
      cons: ['Reward Flipkart ecosystem mein concentrated', 'Top categories pe caps'],
    },
    hi: {
      features: ['Flipkart / Myntra / Cleartrip पर 5%', 'Preferred partners (Swiggy, Uber, PVR, आदि) पर 4%', 'बाकी सब पर 1%', 'Spends पर लाउंज एक्सेस'],
      pros: ['Flipkart + Myntra shoppers के लिए बेस्ट', 'मज़बूत 4% partner लिस्ट', 'Low ₹500 फीस'],
      cons: ['रिवॉर्ड Flipkart ecosystem में concentrated', 'टॉप categories पर caps'],
      usefulFor: 'Flipkart/Myntra loyalists + Swiggy/Uber यूज़र्स।',
    },
  },
  'hdfc-millennia': {
    en: { usefulFor: 'Online shoppers spread across multiple brands (Amazon + Swiggy + Myntra).' },
    hinglish: {
      features: ['Amazon, Flipkart, Swiggy, Zomato, Myntra +6 more pe 5% cashback', 'Baaki spends pe 1%', 'Spends pe quarterly lounge access', 'CashPoints statement credit ke roop mein redeemable'],
      pros: ['Popular all-round online cashback card', '10 partner brands pe 5%', 'Easy eligibility'],
      cons: ['₹1,000 fee (₹1L spend waiver)', '5% ₹1,000/month pe capped'],
    },
    hi: {
      features: ['Amazon, Flipkart, Swiggy, Zomato, Myntra +6 more पर 5% कैशबैक', 'बाकी spends पर 1%', 'Spends पर क्वार्टरली लाउंज एक्सेस', 'CashPoints statement credit के रूप में redeemable'],
      pros: ['पॉपुलर ऑल-राउंड online कैशबैक कार्ड', '10 partner brands पर 5%', 'Easy एलिजिबिलिटी'],
      cons: ['₹1,000 फीस (₹1L spend waiver)', '5% ₹1,000/month पर capped'],
      usefulFor: 'Online shoppers जो कई brands पर खर्च करते हैं (Amazon + Swiggy + Myntra)।',
    },
  },
  'tataneu-infinity-hdfc': {
    en: { usefulFor: 'Tata brand users (BigBasket, Croma, 1mg) + UPI spenders.' },
    hinglish: {
      features: ['Tata brands (BigBasket, Croma, 1mg, AirAsia) pe up to 10% NeuCoins', 'Non-Tata spends pe 1.5% NeuCoins', 'UPI payments pe rewards (RuPay)', 'Lounge access'],
      pros: ['Tata ecosystem (BigBasket/Croma/1mg) ke liye badhiya', 'RuPay se UPI rewards', '1 NeuCoin = ₹1'],
      cons: ['Best value Tata brands mein locked', '₹1,499 fee'],
    },
    hi: {
      features: ['Tata brands (BigBasket, Croma, 1mg, AirAsia) पर up to 10% NeuCoins', 'Non-Tata spends पर 1.5% NeuCoins', 'UPI payments पर रिवॉर्ड (RuPay)', 'लाउंज एक्सेस'],
      pros: ['Tata ecosystem (BigBasket/Croma/1mg) के लिए बढ़िया', 'RuPay से UPI रिवॉर्ड', '1 NeuCoin = ₹1'],
      cons: ['बेस्ट वैल्यू Tata brands में locked', '₹1,499 फीस'],
      usefulFor: 'Tata brand यूज़र्स (BigBasket, Croma, 1mg) + UPI स्पेंडर्स।',
    },
  },
  'hdfc-regalia-gold': {
    en: { usefulFor: 'Mid-premium users who do both travel and shopping.' },
    hinglish: {
      features: ['4 RP / ₹150 + Marks & Spencer, Myntra, Nykaa, Reliance pe 5X', 'Domestic + international lounge access', 'Milestone vouchers (Marriott, Myntra, etc.)', 'Low forex 2%'],
      pros: ['Solid mid-premium travel + rewards', 'Badhiya lounge access', 'Acche milestone benefits'],
      cons: ['Redemption value vary karti hai', '₹2,500 fee'],
    },
    hi: {
      features: ['4 RP / ₹150 + Marks & Spencer, Myntra, Nykaa, Reliance पर 5X', 'घरेलू + अंतरराष्ट्रीय लाउंज एक्सेस', 'माइलस्टोन वाउचर (Marriott, Myntra, आदि)', 'Low forex 2%'],
      pros: ['सॉलिड mid-premium travel + rewards', 'बढ़िया लाउंज एक्सेस', 'अच्छे माइलस्टोन बेनिफिट्स'],
      cons: ['रिडेम्पशन वैल्यू vary करती है', '₹2,500 फीस'],
      usefulFor: 'Mid-premium यूज़र जो travel और shopping दोनों करते हैं।',
    },
  },
  'idfc-first-wealth': {
    en: { usefulFor: 'Travellers who want a no-fee card + low forex.' },
    hinglish: {
      features: ['High spends pe up to 10X reward points', 'Lifetime free — koi annual fee nahi', 'Lounge access + low forex 1.5%', 'Kabhi expire na hone wale reward points'],
      pros: ['Lifetime free premium-ish card', 'Low forex markup (travel ke liye badhiya)', 'Points kabhi expire nahi'],
      cons: ['Top rewards ke liye high spends chahiye', 'Base rate modest'],
    },
    hi: {
      features: ['High spends पर up to 10X reward points', 'Lifetime free — कोई annual fee नहीं', 'लाउंज एक्सेस + low forex 1.5%', 'कभी expire न होने वाले reward points'],
      pros: ['Lifetime free premium-ish कार्ड', 'Low forex मार्कअप (travel के लिए बढ़िया)', 'पॉइंट्स कभी expire नहीं'],
      cons: ['टॉप rewards के लिए high spends चाहिए', 'बेस रेट modest'],
      usefulFor: 'ट्रैवलर्स जो no-fee कार्ड + low forex चाहते हैं।',
    },
  },
  'amex-gold': {
    en: { usefulFor: 'Reward maximisers who understand Amex offers + point transfers.' },
    hinglish: {
      features: ['1 MR point / ₹50; offers se accelerated', '6 transactions/month pe 5,000 bonus points', 'Strong Amex offers (dining, shopping)', 'Points airlines mein transferable'],
      pros: ['Transfers se excellent MR points value', 'Frequent lucrative Amex offers', 'Badhiya milestone bonuses'],
      cons: ['Amex acceptance offline limited', 'Best value ke liye point savvy chahiye'],
    },
    hi: {
      features: ['1 MR point / ₹50; offers से accelerated', '6 transactions/month पर 5,000 bonus points', 'Strong Amex offers (dining, shopping)', 'Points airlines में transferable'],
      pros: ['Transfers से बेहतरीन MR points वैल्यू', 'Frequent फायदेमंद Amex offers', 'बढ़िया माइलस्टोन bonuses'],
      cons: ['Amex acceptance offline limited', 'बेस्ट वैल्यू के लिए point savvy चाहिए'],
      usefulFor: 'रिवॉर्ड maximisers जो Amex offers + point transfers समझते हैं।',
    },
  },
  'hdfc-swiggy': {
    en: { usefulFor: 'Frequent Swiggy / Instamart / Dineout users.' },
    hinglish: {
      features: ['Swiggy pe 10% cashback (food, Instamart, Dineout)', 'Online shopping pe 5%', 'Baaki spends pe 1%', 'Free Swiggy One membership'],
      pros: ['Heavy Swiggy users ke liye best', 'Free Swiggy One fee ke worth', 'General online pe bhi 5%'],
      cons: ['Value Swiggy mein concentrated', '₹500 fee'],
    },
    hi: {
      features: ['Swiggy पर 10% कैशबैक (food, Instamart, Dineout)', 'Online shopping पर 5%', 'बाकी spends पर 1%', 'Free Swiggy One मेंबरशिप'],
      pros: ['हैवी Swiggy users के लिए बेस्ट', 'Free Swiggy One फीस के worth', 'General online पर भी 5%'],
      cons: ['वैल्यू Swiggy में concentrated', '₹500 फीस'],
      usefulFor: 'फ्रीक्वेंट Swiggy / Instamart / Dineout यूज़र्स।',
    },
  },
  'scapia-federal': {
    en: { usefulFor: 'International travellers who want zero-forex + free lounges.' },
    hinglish: {
      features: ['App se book kiye travel pe 10% Scapia coins', 'Baaki sab spends pe 5%', 'Unlimited domestic lounge access', 'Lifetime free + zero forex markup'],
      pros: ['Zero forex + LTF — foreign trips ke liye badhiya', 'Unlimited lounges free', 'High travel rewards'],
      cons: ['Rewards Scapia app bookings tak locked', 'Newer fintech card'],
    },
    hi: {
      features: ['App से book किए travel पर 10% Scapia coins', 'बाकी सब spends पर 5%', 'अनलिमिटेड घरेलू लाउंज एक्सेस', 'Lifetime free + zero forex मार्कअप'],
      pros: ['Zero forex + LTF — foreign trips के लिए बढ़िया', 'अनलिमिटेड लाउंज free', 'हाई travel rewards'],
      cons: ['रिवॉर्ड Scapia app bookings तक locked', 'नया fintech कार्ड'],
      usefulFor: 'अंतरराष्ट्रीय ट्रैवलर्स जो zero-forex + free लाउंज चाहते हैं।',
    },
  },
  'sbi-simplyclick': {
    en: { usefulFor: 'Beginners who want a cheap online-shopping rewards card.' },
    hinglish: {
      features: ['Amazon, BookMyShow, Cleartrip, etc. pe 10X rewards', 'Baaki online spends pe 5X', 'Joining pe Amazon voucher + milestones', 'Low ₹499 fee (₹1L waiver)'],
      pros: ['Sasta entry online-shopping card', 'Acche 10X partners', 'Easy approval'],
      cons: ['Reward value cashback cards se kam', 'Points vs cashback'],
    },
    hi: {
      features: ['Amazon, BookMyShow, Cleartrip, आदि पर 10X rewards', 'बाकी online spends पर 5X', 'Joining पर Amazon voucher + milestones', 'Low ₹499 फीस (₹1L waiver)'],
      pros: ['सस्ता entry online-shopping कार्ड', 'अच्छे 10X partners', 'Easy approval'],
      cons: ['रिवॉर्ड वैल्यू कैशबैक cards से कम', 'Points बनाम cashback'],
      usefulFor: 'शुरुआती लोग जो सस्ता online-shopping रिवॉर्ड कार्ड चाहते हैं।',
    },
  },
  'axis-my-zone': {
    en: { usefulFor: 'Young users who spend on movies + food + OTT.' },
    hinglish: {
      features: ['SonyLIV premium membership', 'Swiggy pe 40% off (limit tak), Paytm movie offers', '4 RP / ₹200 base', 'Spends pe lounge access'],
      pros: ['Sasta (₹500) lifestyle card', 'Acche entertainment + food perks', 'Easy eligibility'],
      cons: ['Base reward rate low', 'Perks capped'],
    },
    hi: {
      features: ['SonyLIV premium मेंबरशिप', 'Swiggy पर 40% off (limit तक), Paytm movie offers', '4 RP / ₹200 base', 'Spends पर लाउंज एक्सेस'],
      pros: ['सस्ता (₹500) lifestyle कार्ड', 'अच्छे entertainment + food perks', 'Easy एलिजिबिलिटी'],
      cons: ['बेस रिवॉर्ड रेट low', 'Perks capped'],
      usefulFor: 'युवा यूज़र जो movies + food + OTT पर खर्च करते हैं।',
    },
  },
  'sbi-simplysave': {
    en: { usefulFor: 'Offline spenders — dining, grocery, department stores.' },
    hinglish: {
      features: ['Dining, movies, groceries, department stores pe 10X rewards', '1 RP / ₹150 base', 'Joining bonus points', 'Fuel surcharge waiver'],
      pros: ['Offline dining + grocery ke liye badhiya', 'Sasti ₹499 fee', 'Easy approval'],
      cons: ['Low base rate', 'Online rewards weak'],
    },
    hi: {
      features: ['Dining, movies, groceries, department stores पर 10X rewards', '1 RP / ₹150 base', 'Joining bonus points', 'Fuel surcharge waiver'],
      pros: ['Offline dining + grocery के लिए बढ़िया', 'सस्ती ₹499 फीस', 'Easy approval'],
      cons: ['Low बेस रेट', 'Online rewards weak'],
      usefulFor: 'Offline स्पेंडर्स — dining, grocery, department stores।',
    },
  },
  'hdfc-moneyback-plus': {
    en: { usefulFor: 'Entry-level online shoppers on a budget.' },
    hinglish: {
      features: ['Amazon, Flipkart, Swiggy, BigBasket, Reliance Smart pe 10X CashPoints', 'Baaki spends pe 2X', '₹50k quarterly spend pe ₹500 gift voucher', 'Low ₹500 fee'],
      pros: ['Sasta online rewards card', 'Acche 10X partners', 'Easy entry'],
      cons: ['CashPoint value modest', '10X pe caps'],
    },
    hi: {
      features: ['Amazon, Flipkart, Swiggy, BigBasket, Reliance Smart पर 10X CashPoints', 'बाकी spends पर 2X', '₹50k quarterly spend पर ₹500 gift voucher', 'Low ₹500 फीस'],
      pros: ['सस्ता online rewards कार्ड', 'अच्छे 10X partners', 'Easy entry'],
      cons: ['CashPoint वैल्यू modest', '10X पर caps'],
      usefulFor: 'बजट वाले entry-level online shoppers।',
    },
  },
  'onecard': {
    en: { usefulFor: 'App-first users who want a no-fee, simple, flexible card.' },
    hinglish: {
      features: ['Top 2 spend categories pe 5X reward points (auto)', 'Lifetime free metal card', 'App se full control, koi hidden charges nahi', 'UPI/contactless friendly'],
      pros: ['Lifetime free + premium metal feel', 'Aapki top categories pe auto 5X', 'Badhiya app experience'],
      cons: ['Reward value modest', 'Base mein koi lounge nahi'],
    },
    hi: {
      features: ['Top 2 spend categories पर 5X reward points (auto)', 'Lifetime free metal कार्ड', 'App से full control, कोई hidden charges नहीं', 'UPI/contactless friendly'],
      pros: ['Lifetime free + premium metal feel', 'आपकी top categories पर auto 5X', 'बढ़िया app experience'],
      cons: ['रिवॉर्ड वैल्यू modest', 'बेस में कोई लाउंज नहीं'],
      usefulFor: 'App-first यूज़र जो no-fee, सिंपल, flexible कार्ड चाहते हैं।',
    },
  },
  'sbi-bpcl-octane': {
    en: { usefulFor: 'Daily drivers who fuel up at BPCL pumps.' },
    hinglish: {
      features: ['BPCL fuel stations pe 7.25% value back', 'Dining, grocery, departmental stores pe 10X', 'Fuel surcharge waiver', 'Welcome bonus points'],
      pros: ['BPCL users ke liye best fuel card', 'High fuel savings', 'Decent grocery/dining rewards'],
      cons: ['Fuel value BPCL pumps tak tied', '₹1,499 fee'],
    },
    hi: {
      features: ['BPCL fuel stations पर 7.25% value back', 'Dining, grocery, departmental stores पर 10X', 'Fuel surcharge waiver', 'Welcome bonus points'],
      pros: ['BPCL users के लिए बेस्ट fuel कार्ड', 'हाई fuel savings', 'Decent grocery/dining rewards'],
      cons: ['Fuel वैल्यू BPCL pumps तक tied', '₹1,499 फीस'],
      usefulFor: 'रोज़ गाड़ी चलाने वाले जो BPCL pumps पर fuel भरते हैं।',
    },
  },
  'idfc-first-millennia': {
    en: { usefulFor: 'First-time card users / credit builders — no fee.' },
    hinglish: {
      features: ['High/incremental spends pe up to 10X points', 'Lifetime free', 'Low forex 3.5% + buy-now-pay-later', 'Kabhi expire na hone wale points'],
      pros: ['Lifetime free entry card', 'Points kabhi expire nahi', 'Credit banane ke liye badhiya'],
      cons: ['Base rate low', 'Top rate ke liye high spend chahiye'],
    },
    hi: {
      features: ['High/incremental spends पर up to 10X points', 'Lifetime free', 'Low forex 3.5% + buy-now-pay-later', 'कभी expire न होने वाले points'],
      pros: ['Lifetime free entry कार्ड', 'पॉइंट्स कभी expire नहीं', 'क्रेडिट बनाने के लिए बढ़िया'],
      cons: ['बेस रेट low', 'टॉप रेट के लिए high spend चाहिए'],
      usefulFor: 'पहली बार कार्ड लेने वाले / credit builders — कोई फीस नहीं।',
    },
  },
  'hsbc-cashback': {
    en: { usefulFor: 'Users who want simple uncapped online cashback.' },
    hinglish: {
      features: ['Online spends pe 1.5% unlimited cashback', 'Baaki spends pe 1%', '₹2L annual spend pe lifetime free', 'Auto-credited cashback'],
      pros: ['Simple unlimited 1.5% online (koi cap nahi)', 'Lifetime free ho sakta hai', 'Koi category juggling nahi'],
      cons: ['Rate SBI Cashback se kam', 'HSBC limited presence'],
    },
    hi: {
      features: ['Online spends पर 1.5% अनलिमिटेड कैशबैक', 'बाकी spends पर 1%', '₹2L annual spend पर lifetime free', 'ऑटो-क्रेडिटेड कैशबैक'],
      pros: ['Simple अनलिमिटेड 1.5% online (कोई cap नहीं)', 'Lifetime free हो सकता है', 'कोई category juggling नहीं'],
      cons: ['रेट SBI Cashback से कम', 'HSBC limited presence'],
      usefulFor: 'यूज़र जो सिंपल uncapped online कैशबैक चाहते हैं।',
    },
  },
  'au-lit': {
    en: { usefulFor: 'Hands-on users who want to customise their card.' },
    hinglish: {
      features: ['Customisable — apni categories pe accelerated rewards choose karo', 'Lifetime free (feature-based pricing)', 'Sirf un features ke paise jo on karo', 'Flexible benefits'],
      pros: ['Fully customisable rewards', 'Lifetime free base', 'Pay-per-feature model'],
      cons: ['Best value ke liye active management chahiye', 'Features extra cost'],
    },
    hi: {
      features: ['Customisable — अपनी categories पर accelerated rewards choose करो', 'Lifetime free (feature-based pricing)', 'सिर्फ़ उन features के पैसे जो on करो', 'Flexible benefits'],
      pros: ['पूरी तरह customisable rewards', 'Lifetime free base', 'Pay-per-feature मॉडल'],
      cons: ['बेस्ट वैल्यू के लिए active management चाहिए', 'Features extra cost'],
      usefulFor: 'Hands-on यूज़र जो अपना कार्ड customise करना चाहते हैं।',
    },
  },
};

const bestCardsI18nApi = { BEST_CARDS_I18N };
if (typeof module !== 'undefined' && module.exports) module.exports = bestCardsI18nApi;
if (typeof globalThis !== 'undefined') globalThis.CardWizBestCardsI18n = bestCardsI18nApi;
