/*
 * CardWiz — Curated "Best Cards in Market" (Tab 1).
 * --------------------------------------------------------------------
 * Hand-picked top India cards with tier, "best for" badges, features,
 * pros/cons, aur "useful for" (kaun sabse zyada faida uthayega).
 *
 * tier: 'elite' | 'premium' | 'solid'  (Elite > Premium > Solid)
 * cardId: catalog id (Apply link + naam ke liye). Naam yahan bhi hai (offline-safe).
 *
 * NOTE: reward rates/fees indicative hain; bank terms badal sakti hain.
 *       "Apply" cardreferral.js ka getApplyUrl use karta hai (referral/fallback).
 */

const TIER_META = {
  elite:   { label: 'Elite',   cls: 'tier-elite',   icon: '👑' },
  premium: { label: 'Premium', cls: 'tier-premium', icon: '💎' },
  solid:   { label: 'Solid',   cls: 'tier-solid',   icon: '✅' },
};

const BEST_CARDS = [
  // ---------------- ELITE ----------------
  {
    cardId: 'hdfc-infinia', name: 'HDFC Infinia (Metal)', bank: 'HDFC', tier: 'elite',
    badges: ['Travel', 'Lounge', 'Points'],
    features: [
      '5 Reward Points / ₹150 (~3.3% value) on almost everything',
      'Unlimited domestic + international lounge access',
      '10X points via SmartBuy on flights/hotels',
      'Golf, concierge, low 2% forex markup',
    ],
    pros: ['Best all-round premium rewards card', 'Unlimited lounges + great redemptions', 'High value on travel via SmartBuy'],
    cons: ['Invite-only / high eligibility (₹3L+ salary or HNW)', '₹12,500 + GST annual fee'],
    usefulFor: 'High spenders (₹3L+/month) jo travel karte hain aur points ko flights/hotels mein redeem karte hain.',
  },
  {
    cardId: 'axis-atlas', name: 'Axis Bank Atlas', bank: 'Axis', tier: 'elite',
    badges: ['Air Miles', 'Travel', 'Lounge'],
    features: [
      '2-5 EDGE Miles / ₹100; travel pe accelerated',
      'Miles airline/hotel partners mein transfer (high value)',
      'Domestic + international lounge access',
      'Milestone bonus miles on annual spends',
    ],
    pros: ['India ka best miles card travel ke liye', 'Strong airline transfer partners', 'Tiered benefits (Silver/Gold/Platinum)'],
    cons: ['Value tabhi jab miles transfer karke use karo', '₹5,000 annual fee'],
    usefulFor: 'Frequent flyers jo airline miles collect karke business/award tickets lete hain.',
  },
  {
    cardId: 'amex-platinum-charge', name: 'Amex Platinum Charge', bank: 'American Express', tier: 'elite',
    badges: ['Premium', 'Travel', 'Lounge'],
    features: [
      'Taj/Marriott/Hilton elite status + hotel benefits',
      'Unlimited international + domestic lounges (Centurion/Priority Pass)',
      'Concierge, fine-dining, milestone vouchers',
      'Strong Membership Rewards earning',
    ],
    pros: ['Ultra-premium lifestyle + travel perks', 'Best hotel status benefits in India', 'Excellent customer service'],
    cons: ['₹66,000 annual fee — sirf heavy users ke liye worth', 'Amex acceptance smaller than Visa/MC'],
    usefulFor: 'Affluent travellers jo hotel stays + lounges + concierge ka full use karte hain.',
  },
  {
    cardId: 'hdfc-diners-black', name: 'HDFC Diners Club Black', bank: 'HDFC', tier: 'elite',
    badges: ['Travel', 'Lounge', 'Points'],
    features: [
      '5 RP / ₹150 (~3.3%) + 10X via SmartBuy',
      'Unlimited lounge (self + add-on)',
      '6 complimentary memberships (Swiggy One, Times Prime, etc.)',
      'Low forex, golf, concierge',
    ],
    pros: ['Infinia-level rewards at slightly easier eligibility', 'Bundled subscriptions add big value', 'Great SmartBuy redemptions'],
    cons: ['Diners network acceptance kam (offline)', '₹10,000 annual fee'],
    usefulFor: 'High online + travel spenders jo SmartBuy aur bundled memberships use karte hain.',
  },
  {
    cardId: 'icici-emeralde-private-metal', name: 'ICICI Emeralde Private Metal', bank: 'ICICI', tier: 'elite',
    badges: ['Premium', 'Lounge', 'Points'],
    features: [
      '6 RP / ₹200 unlimited; strong redemption',
      'Unlimited domestic + international lounges',
      'Golf, BookMyShow, EazyDiner Prime, concierge',
      'Low forex markup',
    ],
    pros: ['Top-tier ICICI metal card', 'Wide acceptance (Mastercard/Visa)', 'Great lifestyle + travel perks'],
    cons: ['₹12,499 annual fee', 'High eligibility'],
    usefulFor: 'Premium users jo wide-acceptance metal card + lounges + lifestyle perks chahte hain.',
  },

  // ---------------- PREMIUM ----------------
  {
    cardId: 'sbi-cashback', name: 'SBI Cashback Card', bank: 'SBI', tier: 'premium',
    badges: ['Cashback', 'Online Shopping'],
    features: [
      '5% cashback on ALL online spends (no merchant restriction)',
      '1% offline cashback',
      'Auto-credited cashback (no redemption)',
      'Monthly cap ₹5,000 cashback',
    ],
    pros: ['Best flat online cashback card in India', 'No category juggling — sab online pe 5%', 'Cashback seedha statement mein'],
    cons: ['₹999 annual fee (₹2L spend pe waiver)', 'Rent/wallet/fuel excluded'],
    usefulFor: 'Online shoppers — Amazon, Flipkart, Myntra, koi bhi site pe flat 5%.',
  },
  {
    cardId: 'axis-ace', name: 'Axis Bank ACE', bank: 'Axis', tier: 'premium',
    badges: ['Cashback', 'Bills', 'Food'],
    features: [
      '5% cashback on Google Pay bills/recharges',
      '4% on Swiggy/Zomato/Ola',
      '2% flat cashback on everything else',
      'Lounge access on spends',
    ],
    pros: ['Excellent 2% flat cashback', '5% on utility bills via GPay', 'Low ₹499 fee (waiver on ₹2L)'],
    cons: ['5%/4% have monthly caps', 'GPay dependency for top rate'],
    usefulFor: 'Bill payers + food orderers jo flat 2% har jagah chahte hain.',
  },
  {
    cardId: 'amazon-pay-icici', name: 'Amazon Pay ICICI', bank: 'ICICI', tier: 'premium',
    badges: ['Cashback', 'Amazon'],
    features: [
      '5% on Amazon (Prime) / 3% (non-Prime)',
      '2% on Amazon Pay partner merchants',
      '1% on all other spends',
      'Lifetime free — no annual fee',
    ],
    pros: ['Lifetime free + no joining fee', 'Best card for heavy Amazon users', 'Amazon Pay balance instantly usable'],
    cons: ['Reward best sirf Amazon ecosystem mein', 'Low rate outside Amazon'],
    usefulFor: 'Amazon regulars + Prime members — koi fee nahi, 5% wapas.',
  },
  {
    cardId: 'flipkart-axis', name: 'Flipkart Axis Bank', bank: 'Axis', tier: 'premium',
    badges: ['Cashback', 'Flipkart', 'Travel'],
    features: [
      '5% on Flipkart / Myntra / Cleartrip',
      '4% on preferred partners (Swiggy, Uber, PVR, etc.)',
      '1% on everything else',
      'Lounge access on spends',
    ],
    pros: ['Best for Flipkart + Myntra shoppers', 'Strong 4% partner list', 'Low ₹500 fee'],
    cons: ['Reward concentrated in Flipkart ecosystem', 'Caps on top categories'],
    usefulFor: 'Flipkart/Myntra loyalists + Swiggy/Uber users.',
  },
  {
    cardId: 'hdfc-millennia', name: 'HDFC Millennia', bank: 'HDFC', tier: 'premium',
    badges: ['Cashback', 'Online Shopping'],
    features: [
      '5% cashback on Amazon, Flipkart, Swiggy, Zomato, Myntra +6 more',
      '1% on other spends',
      'Quarterly lounge access on spends',
      'CashPoints redeemable as statement credit',
    ],
    pros: ['Popular all-round online cashback card', '10 partner brands at 5%', 'Easy eligibility'],
    cons: ['₹1,000 fee (₹1L spend waiver)', '5% capped at ₹1,000/month'],
    usefulFor: 'Online shoppers spread across multiple brands (Amazon + Swiggy + Myntra).',
  },
  {
    cardId: 'tataneu-infinity-hdfc', name: 'Tata Neu Infinity HDFC', bank: 'HDFC', tier: 'premium',
    badges: ['Cashback', 'Shopping', 'Lounge'],
    features: [
      'Up to 10% NeuCoins on Tata brands (BigBasket, Croma, 1mg, AirAsia)',
      '1.5% NeuCoins on non-Tata spends',
      'UPI payments earn rewards (RuPay)',
      'Lounge access',
    ],
    pros: ['Great for Tata ecosystem (BigBasket/Croma/1mg)', 'UPI rewards via RuPay', '1 NeuCoin = ₹1'],
    cons: ['Best value locked in Tata brands', '₹1,499 fee'],
    usefulFor: 'Tata brand users (BigBasket, Croma, 1mg) + UPI spenders.',
  },
  {
    cardId: 'hdfc-regalia-gold', name: 'HDFC Regalia Gold', bank: 'HDFC', tier: 'premium',
    badges: ['Travel', 'Lounge', 'Points'],
    features: [
      '4 RP / ₹150 + 5X on Marks & Spencer, Myntra, Nykaa, Reliance',
      'Domestic + international lounge access',
      'Milestone vouchers (Marriott, Myntra, etc.)',
      'Low forex 2%',
    ],
    pros: ['Solid mid-premium travel + rewards', 'Good lounge access', 'Nice milestone benefits'],
    cons: ['Redemption value varies', '₹2,500 fee'],
    usefulFor: 'Mid-premium users jo travel + shopping dono karte hain.',
  },
  {
    cardId: 'idfc-first-wealth', name: 'IDFC FIRST Wealth', bank: 'IDFC FIRST', tier: 'premium',
    badges: ['Lifetime Free', 'Rewards', 'Lounge'],
    features: [
      'Up to 10X reward points on high spends',
      'Lifetime free — no annual fee',
      'Lounge access + low forex 1.5%',
      'Never-expiring reward points',
    ],
    pros: ['Lifetime free premium-ish card', 'Low forex markup (great for travel)', 'Points never expire'],
    cons: ['Top rewards need high spends', 'Base rate modest'],
    usefulFor: 'Travellers jo no-fee card + low forex chahte hain.',
  },
  {
    cardId: 'amex-gold', name: 'Amex Membership Rewards Gold', bank: 'American Express', tier: 'premium',
    badges: ['Points', 'Dining'],
    features: [
      '1 MR point / ₹50; accelerated via offers',
      '5,000 bonus points on 6 transactions/month',
      'Strong Amex offers (dining, shopping)',
      'Points transferable to airlines',
    ],
    pros: ['Excellent MR points value via transfers', 'Frequent lucrative Amex offers', 'Great milestone bonuses'],
    cons: ['Amex acceptance limited offline', 'Best value needs point savvy'],
    usefulFor: 'Reward maximisers jo Amex offers + point transfers samajhte hain.',
  },
  {
    cardId: 'hdfc-swiggy', name: 'Swiggy HDFC Bank', bank: 'HDFC', tier: 'premium',
    badges: ['Food', 'Cashback'],
    features: [
      '10% cashback on Swiggy (food, Instamart, Dineout)',
      '5% on online shopping',
      '1% on other spends',
      'Free Swiggy One membership',
    ],
    pros: ['Best card for heavy Swiggy users', 'Free Swiggy One worth the fee', '5% on general online too'],
    cons: ['Value concentrated in Swiggy', '₹500 fee'],
    usefulFor: 'Frequent Swiggy / Instamart / Dineout users.',
  },
  {
    cardId: 'scapia-federal', name: 'Scapia Federal', bank: 'Federal', tier: 'premium',
    badges: ['Travel', 'Lifetime Free', 'Lounge'],
    features: [
      '10% Scapia coins on travel booked via app',
      '5% on all other spends',
      'Unlimited domestic lounge access',
      'Lifetime free + zero forex markup',
    ],
    pros: ['Zero forex + LTF — great for foreign trips', 'Unlimited lounges free', 'High travel rewards'],
    cons: ['Rewards locked to Scapia app bookings', 'Newer fintech card'],
    usefulFor: 'International travellers jo zero-forex + free lounges chahte hain.',
  },

  // ---------------- SOLID ----------------
  {
    cardId: 'sbi-simplyclick', name: 'SBI SimplyCLICK', bank: 'SBI', tier: 'solid',
    badges: ['Online Shopping', 'Rewards'],
    features: [
      '10X rewards on Amazon, BookMyShow, Cleartrip, etc.',
      '5X on other online spends',
      'Amazon voucher on joining + milestones',
      'Low ₹499 fee (₹1L waiver)',
    ],
    pros: ['Cheap entry online-shopping card', 'Good 10X partners', 'Easy approval'],
    cons: ['Reward value lower than cashback cards', 'Points vs cashback'],
    usefulFor: 'Beginners jo sasta online-shopping rewards card chahte hain.',
  },
  {
    cardId: 'axis-my-zone', name: 'Axis MY Zone', bank: 'Axis', tier: 'solid',
    badges: ['Entertainment', 'Food'],
    features: [
      'SonyLIV premium membership',
      '40% off on Swiggy (up to limit), Paytm movie offers',
      '4 RP / ₹200 base',
      'Lounge access on spends',
    ],
    pros: ['Cheap (₹500) lifestyle card', 'Good entertainment + food perks', 'Easy eligibility'],
    cons: ['Base reward rate low', 'Perks capped'],
    usefulFor: 'Young users jo movies + food + OTT pe kharch karte hain.',
  },
  {
    cardId: 'sbi-simplysave', name: 'SBI SimplySAVE', bank: 'SBI', tier: 'solid',
    badges: ['Dining', 'Grocery'],
    features: [
      '10X rewards on dining, movies, groceries, department stores',
      '1 RP / ₹150 base',
      'Joining bonus points',
      'Fuel surcharge waiver',
    ],
    pros: ['Good for offline dining + grocery', 'Cheap ₹499 fee', 'Easy approval'],
    cons: ['Low base rate', 'Online rewards weak'],
    usefulFor: 'Offline spenders — dining, grocery, department stores.',
  },
  {
    cardId: 'hdfc-moneyback-plus', name: 'HDFC MoneyBack+', bank: 'HDFC', tier: 'solid',
    badges: ['Online Shopping', 'Rewards'],
    features: [
      '10X CashPoints on Amazon, Flipkart, Swiggy, BigBasket, Reliance Smart',
      '2X on other spends',
      '₹500 gift voucher on ₹50k quarterly spend',
      'Low ₹500 fee',
    ],
    pros: ['Cheap online rewards card', 'Good 10X partners', 'Easy entry'],
    cons: ['CashPoint value modest', 'Caps on 10X'],
    usefulFor: 'Entry-level online shoppers on a budget.',
  },
  {
    cardId: 'onecard', name: 'OneCard (Metal)', bank: 'OneCard', tier: 'solid',
    badges: ['Lifetime Free', 'App-first'],
    features: [
      '5X reward points on top 2 spend categories (auto)',
      'Lifetime free metal card',
      'Full control via app, no hidden charges',
      'UPI/contactless friendly',
    ],
    pros: ['Lifetime free + premium metal feel', 'Auto 5X on your top categories', 'Great app experience'],
    cons: ['Reward value modest', 'No lounge in base'],
    usefulFor: 'App-first users jo no-fee, simple, flexible card chahte hain.',
  },
  {
    cardId: 'sbi-bpcl-octane', name: 'BPCL SBI Octane', bank: 'SBI', tier: 'solid',
    badges: ['Fuel'],
    features: [
      '7.25% value back at BPCL fuel stations',
      '10X on dining, grocery, departmental stores',
      'Fuel surcharge waiver',
      'Welcome bonus points',
    ],
    pros: ['Best fuel card for BPCL users', 'High fuel savings', 'Decent grocery/dining rewards'],
    cons: ['Fuel value tied to BPCL pumps', '₹1,499 fee'],
    usefulFor: 'Daily drivers jo BPCL pumps pe fuel bharte hain.',
  },
  {
    cardId: 'idfc-first-millennia', name: 'IDFC FIRST Millennia', bank: 'IDFC FIRST', tier: 'solid',
    badges: ['Lifetime Free', 'Rewards'],
    features: [
      'Up to 10X points on high/incremental spends',
      'Lifetime free',
      'Low forex 3.5% + buy-now-pay-later',
      'Never-expiring points',
    ],
    pros: ['Lifetime free entry card', 'Points never expire', 'Good for building credit'],
    cons: ['Base rate low', 'Top rate needs high spend'],
    usefulFor: 'First-time card users / credit builders — no fee.',
  },
  {
    cardId: 'hsbc-cashback', name: 'HSBC Cashback', bank: 'HSBC', tier: 'solid',
    badges: ['Cashback', 'Online Shopping'],
    features: [
      '1.5% unlimited cashback on online spends',
      '1% on other spends',
      'Lifetime free on ₹2L annual spend',
      'Auto-credited cashback',
    ],
    pros: ['Simple unlimited 1.5% online (no cap)', 'Can be lifetime free', 'No category juggling'],
    cons: ['Rate lower than SBI Cashback', 'HSBC limited presence'],
    usefulFor: 'Users jo simple uncapped online cashback chahte hain.',
  },
  {
    cardId: 'au-lit', name: 'AU Bank LIT', bank: 'AU Bank', tier: 'solid',
    badges: ['Customisable', 'Lifetime Free'],
    features: [
      'Customisable — apni categories pe accelerated rewards choose karo',
      'Lifetime free (feature-based pricing)',
      'Pay only for features you turn on',
      'Flexible benefits',
    ],
    pros: ['Fully customisable rewards', 'Lifetime free base', 'Pay-per-feature model'],
    cons: ['Best value needs active management', 'Features cost extra'],
    usefulFor: 'Hands-on users jo apne hisaab se card customise karna chahte hain.',
  },
];

// ---------- Exports (browser/node) ----------
const bestCardsApi = { TIER_META, BEST_CARDS };
if (typeof module !== 'undefined' && module.exports) module.exports = bestCardsApi;
if (typeof globalThis !== 'undefined') globalThis.CardWizBestCards = bestCardsApi;
