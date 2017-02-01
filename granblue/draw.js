"use strict";

// from http://www.math.ucla.edu/~tom/distributions/binomial.html {{{

function LogGamma(Z) {
    var S=1+76.18009173/Z-86.50532033/(Z+1)+24.01409822/(Z+2)-1.231739516/(Z+3)+.00120858003/(Z+4)-.00000536382/(Z+5);
    var LG= (Z-.5)*Math.log(Z+4.5)-(Z+4.5)+Math.log(S*2.50662827465);
    return LG
}

function Betinc(X,A,B) {
    var A0=0;
    var B0=1;
    var A1=1;
    var B1=1;
    var M9=0;
    var A2=0;
    var C9;
    while (Math.abs((A1-A2)/A1)>.00001) {
        A2=A1;
        C9=-(A+M9)*(A+B+M9)*X/(A+2*M9)/(A+2*M9+1);
        A0=A1+C9*A0;
        B0=B1+C9*B0;
        M9=M9+1;
        C9=M9*(B-M9)*X/(A+2*M9-1)/(A+2*M9);
        A1=A0+C9*A1;
        B1=B0+C9*B1;
        A0=A0/B1;
        B0=B0/B1;
        A1=A1/B1;
        B1=1;
    }
    return A1/A
}

function compute(X, N, P) {
    var bincdf;
    var Betacdf;
    if (X<0) {
        Betacdf=0;
    } else if (X>=N) {
        Betacdf=1;
    } else {
        X=Math.floor(X);
        var Z=P;
        var A=X+1;
        var B=N-X;
        var S=A+B;
        var BT=Math.exp(LogGamma(S)-LogGamma(B)-LogGamma(A)+A*Math.log(Z)+B*Math.log(1-Z));
        if (Z<(A+1)/(S+2)) {
            Betacdf=BT*Betinc(Z,A,B)
        } else {
            Betacdf=1-BT*Betinc(1-Z,B,A)
        }
        Betacdf=1-Betacdf;
    }
    return Betacdf;
}

// }}}

// from underscore.js 1.8.3 {{{

var now = Date.now || function() { return new Date().getTime(); };

function debounce(func, wait, immediate) {
    var timeout, args, context, timestamp, result;

    var later = function() {
        var last = now() - timestamp;

        if (last < wait && last >= 0) {
            timeout = setTimeout(later, wait - last);
        } else {
            timeout = null;
            if (!immediate) {
                result = func.apply(context, args);
                if (!timeout) context = args = null;
            }
        }
    };

    return function() {
        context = this;
        args = arguments;
        timestamp = now();
        var callNow = immediate && !timeout;
        if (!timeout) timeout = setTimeout(later, wait);
        if (callNow) {
            result = func.apply(context, args);
            context = args = null;
        }

        return result;
    };
};

// }}}

function uniqBy(a, f) {
    var seen = {};
    return a.filter(function(item) {
        return seen.hasOwnProperty(f(item)) ? false : (seen[f(item)] = true);
    });
}

function removeAllChildren(e) {
    Array.prototype.slice.call(e.childNodes).forEach(function(c) {
        e.removeChild(c);
    });
}

var chartElementID = "chart";
var formulaElement = document.getElementById("formula");

function roundWith(n, m) {
    return Math.round(n * m) / m;
}

var chart;

function plot(min, n, prob) {
    var step = n <= 50 ? 1 : n <= 100 ? 2 : 5;
    var labels = [];
    var data = [];
    var x = min - 1;
    function addPoint(i) {
        labels.push("" + i);
        var p = 1 - compute(x, i, prob);
        data.push({draws: i, p: 100 * p});
    }
    for (var i = 1; i < n; i === 1 ? i += Math.max(1, step - 1) : i += step) {
        addPoint(i);
    }
    addPoint(n);
    formulaElement.innerText =
        "P[X >= " + min + "] for X~B(" + n + ", " +
        roundWith(prob, 1000000) + ") = " +
        roundWith(data[data.length - 1].p / 100, 1000000);

    if (chart !== undefined) {
        chart.setData(data);
        return;
    }

    chart = new Morris.Line({
        element: chartElementID,
        data: data,
        xkey: "draws",
        ykeys: ["p"],
        ymin: 0,
        ymax: 100,
        labels: ["Probability"],
        resize: true,
        parseTime: false,
        postUnits: "%",
        hoverCallback: function (index, options, content, row) {
            var s = row.draws === 1 ? "" : "s";
            var p = roundWith(row.p, 1000);
            if (p === 100 && row.p !== 100) { // don"t round to 100%
                p = row.p;
            }
            return row.draws + " draw" + s +": " + p + "%";
        }
    });
}

var maxDrawsInput = document.getElementById("max-draws");
var minimumInput = document.getElementById("minimum");
var wishlistInput = document.getElementById("wishlist");
var excludeListInput = document.getElementById("exclude-list");
var drawDataInput = document.getElementById("draw-data");
var groupsElement = document.getElementById("group-checkboxes");

var characters;
var charactersByName = {};

var rates;
var ratesByName;
var groups;
var includedGroups = {};

function groupCheckboxID(group) {
    return "group-" + group.replace(/[^a-zA-Z]/, "-");
}

function updateCharacters(cs) {
    characters = cs;
    characters.forEach(function(c) {
        charactersByName[c.name] = c;
    });
}

function updateRates() {
    var dataText = drawDataInput.value;
    var currentGroup = null;
    rates = [];
    ratesByName = {};
    groups = {};
    dataText.split("\n").forEach(function(line) {
        var gm = line.match(/^(.+) Rates$/);
        if (gm) {
            currentGroup = gm[1].replace(/ ?Rare /, "R ");
            groups[currentGroup] = true;
            return;
        }
        var m = line.match(/^ +([^0-9]+) ([0-9\.]+)%/);
        if (!m) return;
        var name = m[1];
        var p = +m[2] / 100;
        var item = {name: name, p: p, group: currentGroup};
        ratesByName[name] = item;
        rates.push(item);
    });
    groups = Object.keys(groups).sort().reverse();
    removeAllChildren(groupsElement);
    groups.forEach(function(group) {
        var id = groupCheckboxID(group);
        var checkbox = document.createElement("input");
        checkbox.type = "checkbox";
        checkbox.id = id;
        checkbox.name = id;
        checkbox.checked = includedGroups[group] || false;
        checkbox.addEventListener("change", function() {
            if (this.checked) {
                includedGroups[group] = true;
            } else {
                delete includedGroups[group];
            }
            updatePlotFromInputs("change");
        });
        var label = document.createElement("label");
        label.htmlFor = id;
        label.innerText = "Any " + group;
        groupsElement.appendChild(checkbox);
        groupsElement.appendChild(label);
        groupsElement.appendChild(document.createElement("br"));
    });
}

function currentState() {
    var n = Math.max(1, Math.min(600, +maxDrawsInput.value));
    var min = Math.max(1, minimumInput.value);
    return {
        n: n,
        m: min,
        w: wishlistInput.value,
        e: excludeListInput.value,
        g: includedGroups,
    };
}

function loadState(st) {
    maxDrawsInput.value = st.n;
    minimumInput.value = st.m;
    wishlistInput.value = st.w;
    excludeListInput.value = st.e || "";
    includedGroups = st.g;
    groups.forEach(function(group) {
        var elem = document.getElementById(groupCheckboxID(group));
        if (elem) {
            elem.checked = includedGroups[group] || false;
        }
    });
}

function loadStateFromHash() {
    var h = window.location.hash;
    if (!h) return;
    h = h.slice(1);
    try {
        var st = decodeState(h);
        loadState(st);
        return true;
    } catch (e) {}
    return false;
}

function encodeState(st) {
    return btoa(JSON.stringify(st));
}

function decodeState(st) {
    return JSON.parse(atob(st));
}

var historyReplaced = false;

function autocorrectNames(names) {
    return uniqBy(names.filter(function(name) {
        return name !== "";
    }).map(function(name) {
        var item = ratesByName[name];
        if (item !== undefined) return item.name;
        var character = charactersByName[name];
        if (character !== undefined) return character.name;
        var distances = {};
        rates.forEach(function(item) {
            distances[item.name] = Levenshtein(item.name, name);
        });
        characters.forEach(function(c) {
            distances[c.name] = Levenshtein(c.name, name);
        });
        var closestWeapon = rates.reduce(function(a, b) {
            return distances[a.name] < distances[b.name] ? a : b;
        }).name;
        var closestCharacter = characters.reduce(function(a, b) {
            return distances[a.name] < distances[b.name] ? a : b;
        }).name;
        var closest = distances[closestWeapon] < distances[closestCharacter] ?
            closestWeapon :
            closestCharacter;
        return closest;
    }), function(name) {
        var c = charactersByName[name];
        if (c === undefined) {
            return name;
        } else {
            return c.join_weapon;
        }
    });
}

function makeSet(xs) {
    var s = {};
    xs.forEach(function(x) {
        s[x] = true;
    });
    return s;
}

function unlines(items) {
    return items.join("\n");
}

function updatePlotFromInputs(ev) {
    var st = currentState();
    var n = st.n;
    var min = st.m;
    var names = st.w.split("\n");
    var excludes = st.e.split("\n");
    var correctedNames = autocorrectNames(names);
    var correctedNameSet = makeSet(correctedNames);
    var correctedExcludes = autocorrectNames(excludes);
    var correctedExcludeSet = makeSet(correctedExcludes);

    var allItems = correctedNames.map(function(name) {
        var rate = ratesByName[name];
        if (rate !== undefined) {
            return rate;
        } else {
            return ratesByName[charactersByName[name].join_weapon];
        }
    }).filter(function(item) {
        return item !== undefined;
    }).concat(rates.filter(function(item) {
        return includedGroups[item.group] && correctedNameSet[item.name] !== true;
    })).filter(function(item) {
        return correctedExcludeSet[item.name] !== true;
    });

    var probs = allItems.map(function(item) { return item.p; });
    var probSum = probs.reduce(function(x, y){ return x + y; }, 0);
    plot(min, n, probSum);

    if (ev === "change") {
        if (maxDrawsInput.value != n) {
            maxDrawsInput.value = n;
        }
        if (minimumInput.value != min) {
            minimumInput.value = min;
        }
        var correctedNamesString = unlines(correctedNames);
        if (wishlistInput.value !== correctedNamesString) {
            wishlistInput.value = correctedNamesString;
        }
        var correctedExcludeString = unlines(correctedExcludes);
        if (excludeListInput.value !== correctedExcludeString) {
            excludeListInput.value = correctedExcludeString;
        }

        var newURL = window.location.href.replace(window.location.hash, "") + "#" + encodeState(st);
        if (historyReplaced) {
            window.history.replaceState(st, window.title, newURL);
        } else {
            window.history.pushState(st, window.title, newURL);
            historyReplaced = true;
        }
    }
}

var debounceDelay = 300; // ms

["change", "keyup"].forEach(function(ev) {
    var onOptionUpdate = debounce(function() { updatePlotFromInputs(ev) }, debounceDelay);
    var onDataUpdate = debounce(function() { updateRates(); updatePlotFromInputs(ev) }, debounceDelay);
    [maxDrawsInput, minimumInput, wishlistInput, excludeListInput].forEach(function(input) {
        input.addEventListener(ev, onOptionUpdate);
    });
    drawDataInput.addEventListener(ev, onDataUpdate);
});
window.addEventListener("popstate", function(e) {
    if (loadStateFromHash()) {
        updatePlotFromInputs();
    }
});

var charactersRequest = new XMLHttpRequest();
charactersRequest.addEventListener("load", function() {
    updateCharacters(JSON.parse(this.responseText).characters);
    updateRates();
    loadStateFromHash();
    updatePlotFromInputs();
});
charactersRequest.open("GET", "characters.json");
charactersRequest.send();
