// ==UserScript==
// @name         GBF Co-op English Autotranslate
// @namespace    https://codensity.github.io/
// @version      0.3
// @description  Translates room descriptions into English
// @match        *://game.granbluefantasy.jp/*
// @match        *://gbf.game.mbga.jp/*
// ==/UserScript==

(function() {
    "use strict";

    // Based on /u/finis_caelorum's Co-op Lobby Phrasebook:
    // https://www.reddit.com/r/Granblue_en/comments/6nucg3/coop_lobby_phrasebook/
    let translations = [
        ["ハード", "Hard"],
        ["ノーマル", "Normal"],
        ["信念", "Creeds"],
        ["集め", " collecting"],

        ["デイリー", "Daily"],
        ["でいりー", "Daily"],
        ["ランク", "Rank"],

        ["スラ爆", "Slimeblasting"],
        ["順貼り", "Train (Host in join order)"],
        ["順張り", "Train (Host in join order)"],
        ["逆順貼り", "Train (Host in reverse join order)"],
        ["逆順張り", "Train (Host in reverse join order)"],
        ["連戦", "Series of Battles"], // not always a train?
        ["30連", "30 player train"],
        ["時間貼り", "(Split hosting by time)"],
        ["主貼り", "(Host is hosting)"],
        ["交代", "(Take turns hosting)"],
        ["分交代", " minute hosting shifts"],

        ["要職", "Need"],
        ["火力", "Carry"],
        ["ワンパン禁止", "No Leeching"],
        ["人から開始", " players before starting"],
        ["人から", " players before starting"],
        ["光", "Light"],
        ["経験者", "Experienced Players"],
        ["行動理解者", "Experienced Players"],
        ["理解者", "Experienced Players"],
        ["開始", " start"],
        ["スタート", " start"],

        ["最終ソーン", "Has 5★ Tweyen"],
        ["麻痺延長有", "Para Extend"],
        ["麻痺延長", "Para Extend"],

        ["団員募集", "Crew Recruiting"],

        ["主弱", "Newbie"],
        ["主", "Host Is "],
        ["募集", " classes requested"],
        ["ポンマス", "Weapon Master"],
        ["パスタ", "Superstar"],
        ["がおー", "Berserker"],
        ["ガオー", "Berserker"],
        ["ベルセ", "Berserker"],
        ["ウォロ", "Warlock"],
        ["魚", "Warlock"],
        ["ダクフェ", "Dark Fencer"],
        ["カオル", "Chaos Ruler"],
        ["ドラマス", "Drum Master"],
        ["エリュ", "Elysian"],
        ["スパルタン", "Spartan"],
        ["義賊", "Bandit Tycoon"],
        ["ハウンド", "Nighthound"],
        ["アプサラス", "Apsaras"],
        ["レスラー", "Luchador"],

        ["裁考", "Vohu Manah"],
        ["灼滅", "Ifrit"],
        ["イフリート", "Ifrit"],
        ["イフ", "Ifrit"],
        ["妃光", "Corrow"],
        ["コロウ", "Corrow"],
        ["氷獄", "Cocytus"],
        ["コキュートス", "Cocytus"],
        ["コキュ", "Cocy"],
        ["人馬", "Sagi"],
        ["サジタリウス", "Sagittarius"],
        ["サジ", "Sagi"],
        ["幻魔", "Diablo"],
        ["ディアボロス", "Diablo"],
        ["ディア", "Diablo"],

        ["ゼノ", "Xeno"],

        ["波濤", "Neptune"],
        ["ネプネプ", "Neptune"],
        ["ネプチューン", "Neptune"],
        ["ネプ", "Neptune"],
        ["花信風", "Zephyrus"],
        ["ゼピュロス", "Zephyrus"],
        ["ゼピュ", "Zephyrus"],
        ["巨巌", "Titan"],
        ["ティターン", "Titan"],
        ["ティタ", "Titan"],
        ["マッチョ", "Titan"], // macho
        ["揺炎", "Agni"],
        ["アグニス", "Agni"],

        ["よわバハ", "Proto-Bahamut"],
        ["よわばは", "Proto-Bahamut"],
        ["プロバハ", "Proto-Bahamut"],
        ["プロトバハムート", "Proto-Bahamut"],
        ["弱バハ", "Proto-Bahamut Normal"],
        ["つよバハ", "Proto-Bahamut HL"],
        ["つよばは", "Proto-Bahamut HL"],
        ["強バハ", "Proto-Bahamut HL"],
        ["アルバハ", "Ultimate Bahamut"],
        ["バハ", "Baha"],
        ["ばは", "Baha"],
        ["ローズ", "Rose Queen"],
        ["薔薇", "Rose Queen"],
        ["グランデ", "Grand Order"],
        ["ンデ", "Grand Order"],
        ["んで", "Grand Order"],

        ["旧石", "T1"],
        ["ナタク", "Nezha"],
        ["マキュラ", "Macula"],
        ["メドゥーサ", "Medusa"],
        ["メドューサ", "Medusa"],
        ["メドゥ子", "Medusa"],
        ["メデュ", "Medusa"],
        ["メド", "Medusa"],
        ["フラム＝グラス", "Twin Elements"],
        ["フラム", "Twin Elements"],
        ["フラマ", "Twin Elements"],
        ["アポロン", "Apollo"],
        ["アポロロ", "Apollo"],
        ["アポロ", "Apollo"],
        ["オリヴィエ", "DAOlivia"],
        ["グランデ素材", "Grand Materials"],

        ["新石", "T2"],
        ["アテナ", "Athena"],
        ["バアル", "Baal"],
        ["グラニ", "Grani"],
        ["ガルダ", "Garuda"],
        ["オーディン", "Odin"],
        ["リッチ", "Lich"],

        ["プロメテウス", "Prometheus"],
        ["プロメテ", "Prometheus"],
        ["カーオン", "Ca Ong"],
        ["鯨", "Ca Ong"],
        ["バイヴカハ", "Morrigna"],
        ["バイブ", "Morrigna"],
        ["バイヴ", "Morrigna"],
        ["ギルガメッシュ", "Gilgamesh"],
        ["ギルガメ", "Gilgamesh"],
        ["ヘクトル", "Hector"],
        ["アヌビス", "Anubis"],

        ["マグナ", "Omega"],
        ["ティアマグ", "Tiamat"],
        ["ティア", "Tia"],
        ["コロマグ", "Colossus"],
        ["コロ", "Colo"],
        ["リヴァマグ", "Leviathan"],
        ["鰻", "Levi"],
        ["うなぎ", "Levi"],
        ["リヴァ", "Levi"],
        ["ユグマグ", "Yggdrasil"],
        ["ゆぐゆぐ", "Yuguyugu"],
        ["ゆぐ", "Ygg"],
        ["ユグ", "Ygg"],
        ["シュヴァマグ", "Luminiera"],
        ["シュヴァリエ", "Luminiera"],
        ["シュヴァ", "Lumi"],
        ["シュヴ", "Lumi"],
        ["シュバ", "Lumi"],
        ["セレマグ", "Celeste"],
        ["セレスト", "Celeste"],
        ["セレ", "Celeste"],

        ["天司", "Primarch"],
        ["ミカエル", "Michael"],
        ["ミカ", "Michael"],
        ["ガブリエル", "Gabriel"],
        ["ガブ", "Gabriel"],
        ["ウリエル", "Uriel"],
        ["ラファ", "Raphael"],
        ["HRT", "HRT (Raphael)"],

        ["シヴァ", "Shiva"],
        ["エウロペ", "Europa"],
        ["ゴッドガード・ブローディア", "Godsworn Alexiel"],
        ["ブローディア", "Alexiel"],
        ["ゴブロ", "Alexiel"],
        ["グリームニル", "Grimnir"],
        ["グリーム", "Grimnir"],
        ["メタトロン", "Metatron"],
        ["アバター", "Avatar"],

        ["黒麒麟", "Qilin"],
        ["黄龍", "Huanglong"],

        ["幽光の羽", "Gleaming Feather"],
        ["泡影の風羽", "Mystical Feather"],
        ["雄風の葉", "Vortical Pinwheel"],
        ["幽光の砂", "Gleaming Sand Bottle"],
        ["泡影の火砂", "Mystical Flame"],
        ["烈火の岩石", "Searing Stone"],
        ["幽光の水", "Gleaming Water Jug"],
        ["泡影の水流", "Mystical Splash"],
        ["麗水の珊瑚", "Resplendent Coral"],
        ["幽光の岩", "Gleaming Stone"],
        ["泡影の岩砂", "Mystical Alluvium"],
        ["豊沃の琥珀", "Opulent Amber"],
        ["赤銅の古紋", "Bronze Disk"], // "-plated" excluded for conciseness
        ["白銀の古紋", "Silver Disk"],
        ["黄金の古紋", "Gold Disk"],

        ["雑談", "Chat Room"],
        ["ＨＬ", "HL"],
        ["ｈｌ", "HL"],
        ["ステージ", "Stage"],
        ["人", " person"],
        ["1回", " once"],
        ["1戦", " once"],
        ["一回", " once"],
        ["一戦", " once"],
        ["二回", " twice"],
        ["二戦", " twice"],
        ["戦", "battle"],
        ["回", " times"]
    ];

    var translationMap = {};
    var translationRegexp = [];
    for (let [from, to] of translations) {
        translationMap[from] = to;
        translationRegexp.push(from);
    }
    // NOTE: this assumes `from` contains no special regex characters
    translationRegexp = new RegExp("(" + translationRegexp.join("|") + ")", "g");

    function translateComment(c) {
        let repPrefix = "" + Math.random();
        let replaced = [];
        let matches = c.match(translationRegexp);
        if (!matches) {
            return c;
        }
        for (let from of matches) {
            let to = translationMap[from];
            // NOTE: `to` and `from` are used, unescaped, as HTML
            if (c.indexOf(from) !== -1) {
                let i = replaced.length;
                replaced.push([from, to]);
                c = c.replace(from, repPrefix + i);
            }
        }
        for (let i = 0, n = replaced.length; i < n; ++i) {
            let [from, to] = replaced[i];
            c = c.replace(repPrefix + i, "<span style='color:#2B732E'>" + to + "</span>");
        }
        return c;
    }

    function translateComments() {
        let comments = document.getElementsByClassName("txt-room-comment");
        for (let comment of comments) {
            let orig = comment.innerHTML;
            let translated = translateComment(orig);
            if (translated !== orig) {
                comment.addEventListener("contextmenu", function(ev) {
                    prompt("Original Description:", orig);
                    ev.preventDefault();
                });
                comment.innerHTML = translated;
                comment.title = orig;
            }
        }
    }

    function toString() {
        return "".toString.toString();
    }
    toString.toString = toString;

    function hookArguments(o, name, f) {
        let p = o.prototype;
        let orig = p[name];
        p[name] = function() {
            f.apply(this, arguments);
            return orig.apply(this, arguments);
        };
        p[name].toString = function() {
            return orig.toString();
        };
        p[name].toString.toString = toString;
    }

    function installHooks() {
        hookArguments(XMLHttpRequest, "send", function() {
            this.addEventListener("readystatechange", function() {
                if (this.readyState != XMLHttpRequest.DONE) { return; }
                let contentType = this.getResponseHeader("Content-Type") || "";
                if (this.status == 200 &&
                    contentType.indexOf("application/json") !== -1) {
                    if (this.responseURL.indexOf("/coopraid/offers/") !== -1 ||
                        this.responseURL.indexOf("/lobby/offers/") !== -1 ||
                        this.responseURL.indexOf("/coopraid/content/room/") !== -1) {
                        // The comment views will be rendered later in this
                        // tick, so defer translation to the next tick.
                        setTimeout(translateComments, 0);
                    }
                }
            }, false);
        });
    }

    installHooks();
})();
