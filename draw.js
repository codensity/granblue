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

// from http://www.ciphersbyritter.com/JAVASCRP/BINOMPOI.HTM#Binomial

function factorial(x) {
    var t=1;
    while (x > 1)
        t *= x--;
    return t;
}

// ln(x!) by Stirling's formula
//   see Knuth I: 111
function LnFact(x) {
    if (x <= 1) x = 1;

    if (x < 12) {
        return Math.log(factorial(Math.round(x)));
    } else {
        var invx = 1 / x;
        var invx2 = invx * invx;
        var invx3 = invx2 * invx;
        var invx5 = invx3 * invx2;
        var invx7 = invx5 * invx2;

        var sum = ((x + 0.5) * Math.log(x)) - x;
        sum += Math.log(2*Math.PI) / 2;
        sum += (invx / 12) - (invx3 / 360);
        sum += (invx5 / 1260) - (invx7 / 1680);

        return sum;
    }
}

function LnComb(n, k) {
    if (k == 0 || k == n) {
        return 0;
    } else if (k > n || k < 0) {
        return -1E38;
    } else {
        return LnFact(n) - LnFact(k) - LnFact(n - k);
    }
}

// for success probability p and n trials
//     probability of exactly k successes
function BinomTerm(k, n, p) {
  return Math.exp(LnComb(n, k)
      + k * Math.log(p)
      + (n - k) * Math.log(1 - p));
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

var chartCumulativeElementID = "chart-cumulative";
var chartDistributionElementID = "chart-distribution";
var chartDistributionModeSelectElement = document.getElementById("chart-distribution-mode");
var chartDistributionDrawCountElement = document.getElementById("chart-distribution-draw-count");
var formulaElement = document.getElementById("formula");

function roundWith(n, m) {
    return Math.round(n * m) / m;
}

function percentageRound(orig) {
    var p = roundWith(orig, 1000);
    if (p === 100 && orig !== 100) { // don't round to 100%
        p = orig;
    }
    return p;
}

function pluralSuffix(n) {
    return n === 1 ? "" : "s";
}

var chartCumulative;
var chartDistribution;
var lastChartProb = null;

// Replaced for improved performance. We don't need this to be accurate.
Morris.Grid.prototype.measureText = function(text, angle) {
    if (text === undefined) {
        return {width:0,height:0};
    } else {
        return {width:25,height:16};
    }
};

// Patch drawXAxis to always draw all labels and skip angle transforms.
Morris.Bar.prototype.drawXAxis = function() {
    var i, label, margin, offset, row, textBox, ypos, _i, _ref, _results;
    ypos = this.bottom + (this.options.xAxisLabelTopPadding || this.options.padding / 2);
    _results = [];
    for (i = _i = 0, _ref = this.data.length; 0 <= _ref ? _i < _ref : _i > _ref; i = 0 <= _ref ? ++_i : --_i) {
        row = this.data[this.data.length - 1 - i];
        label = this.drawXAxisLabel(row._x, ypos, row.label);
        textBox = label.getBBox();
        label.transform("t0," + (textBox.height / 2) + "...");
        _results.push(textBox.x - this.options.xLabelMargin);
    }
    return _results;
};

var selectedDistributionDrawCount = 1/0; // +inf
var lastPlotCumulativeInputKey = [];
function plotCumulative(min, n, prob) {
    var inputKey = [min, n, prob].toString();
    if (inputKey === lastPlotCumulativeInputKey) {
        return;
    }
    lastPlotCumulativeInputKey = inputKey;

    var step =
        n <= 50 ? 1 :
        n <= 100 ? 2 :
        n <= 300 ? 5 :
        n <= 600 ? 10 :
        50;
    var data = [];
    var x = min - 1;
    function addPoint(i) {
        var p = 1 - compute(x, i, prob);
        data.push({draws: i, p: 100 * p});
    }
    for (var i = 1; i < n; i === 1 ? i += Math.max(1, step - 1) : i += step) {
        addPoint(i);
    }
    addPoint(n);
    formulaElement.innerHTML =
        "P[X >= " + min + "] for X~B(" + n + ", " +
        roundWith(prob, 1000000) + ") = " +
        roundWith(data[data.length - 1].p / 100, 1000000) +
        "<br>P[X = " + min + "] for X~B(" + n + ", " +
        roundWith(prob, 1000000) + ") = " +
        roundWith(BinomTerm(min, n, prob), 1000000);

    lastChartProb = prob;

    if (chartCumulative !== undefined) {
        chartCumulative.setData(data);
        return;
    }

    chartCumulative = new Morris.Line({
        element: chartCumulativeElementID,
        data: data,
        axes: "y", // x-axis omitted for speed
        xkey: "draws",
        ykeys: ["p"],
        ymin: 0,
        ymax: 100,
        labels: ["Probability"],
        resize: true,
        parseTime: false,
        postUnits: "%",
        hoverCallback: function (index, options, content, row) {
            var s = pluralSuffix(row.draws);
            var p = percentageRound(row.p);
            return row.draws + " draw" + s + ": " + p + "%";
        }
    });
    chartCumulative.on("click", function(i, src) {
        var min = +minimumInput.value;
        if (src.draws < +maxDrawsInput.value) {
            selectedDistributionDrawCount = src.draws;
        } else {
            selectedDistributionDrawCount = 1/0; // +inf
        }
        plotDistribution(min, src.draws, lastChartProb);
    });
}

function distributionPlotStart(min, exact) {
    var startOffset = 9;
    return Math.max(exact ? 0 : 1, min - startOffset);
}

var lastPlotDistributionInputKey = [];
function plotDistribution(min, n, prob) {
    var mode = chartDistributionModeSelectElement.value;
    var exact = mode === "eq";
    var start = distributionPlotStart(min, exact);

    var inputKey = [start, n, prob, mode, currentState().m].toString();
    if (inputKey === lastPlotDistributionInputKey) {
        return;
    }
    lastPlotDistributionInputKey = inputKey;

    var data = [];
    var calc;
    var maxP = 0;
    if (exact) {
        calc = BinomTerm;
    } else {
        calc = function(x, n, p) {
            return 1 - compute(x - 1, n, p);
        };
    }
    for (var x = start, m = x + 20; x < m; x++) {
        var p = calc(x, n, prob);
        maxP = Math.max(p, maxP);
        data.push({x: x, p: 100 * p});
    }

    chartDistributionDrawCountElement.innerText =
        "" + n + " draw" + pluralSuffix(n) + ":";

    if (chartDistribution !== undefined) {
        chartDistribution.setData(data);
        return;
    }

    chartDistribution = new Morris.Bar({
        element: chartDistributionElementID,
        data: data,
        xkey: "x",
        ykeys: ["p"],
        ymin: 0,
        ymax: 100,
        labels: ["Probability"],
        resize: true,
        parseTime: false,
        postUnits: "%",
        hideHover: true,
        barColors: function (row, sidx, type) {
            var min = +minimumInput.value;
            var mode = chartDistributionModeSelectElement.value;
            var start = distributionPlotStart(min, mode === "eq");
            var highlight = type === "bar" && row.x + start === min;
            return highlight ? "#4bafea" : "#0b62a4";
        },
        hoverCallback: function (index, options, content, row) {
            var p = percentageRound(row.p);
            return row.x + ": " + p + "%";
        }
    });
    chartDistribution.on("click", function(i, src) {
        var min = src.x;
        if (min < 1) return;
        minimumInput.value = min;
        var e = document.createEvent("HTMLEvents");
        e.initEvent("change", false, true);
        minimumInput.dispatchEvent(e);
    });
}

var maxDrawsInput = document.getElementById("max-draws");
var minimumInput = document.getElementById("minimum");
var wishlistInput = document.getElementById("wishlist");
var excludeListInput = document.getElementById("exclude-list");
var drawDataInput = document.getElementById("draw-data");
var queriesElement = document.getElementById("queries");
var addQueryElement = document.getElementById("add-query");

var characters;
var charactersByName = {};
var charactersByWeaponName = {};

var drawItemElements;;

var rates;
var ratesByName;
var queries = [];
var characterProperties = ['rarity', 'element', 'race'];
var propertySets = {};
characterProperties.forEach(function(p) {
    propertySets[p] = {};
});

function idify(name) {
    return name.replace(/[^a-zA-Z]/, "-");
}

function splitGroup(g) {
    return g.split(" ");
}

function ucfirst(s) {
    return s.charAt(0).toUpperCase() + s.slice(1);
}

function updateCharacters(cs) {
    characters = cs;
    characters.forEach(function(c) {
        charactersByName[c.name] = c;
        charactersByWeaponName[c.join_weapon] = c;
        characterProperties.forEach(function(p) {
            propertySets[p][c[p]] = true;
        });
    });
}

function updateDrawItemElements(es) {
    drawItemElements = es;
}

function updateRates() {
    var dataText = drawDataInput.value;
    var currentRarity = null;
    var currentKind = null;
    rates = [];
    ratesByName = {};
    dataText.split("%").forEach(function(part) {
        part = part.trim();
        var rate_header = part.match(/^(.+) Rates [0-9\.]+$/);
        if (rate_header) {
            return;
        }
        var gm = part.match(/^(.+) Rates/);
        if (gm) {
            var group = gm[1].replace(/ ?Rare /, "R ");
            var groupParts = splitGroup(group);
            currentRarity = groupParts[0];
            currentKind = groupParts[1];
            part = part.slice(gm[0].length);
            part = part.trim();
            if (part.length === 0) {
                return;
            }
        }
        var m = part.match(/^(.+[^0-9\. ]) ?(\n +\([^()]+\) *)?([0-9\.]+)$/);
        if (!m) {
            if (part.length !== 0) {
                console.log("failed to parse", JSON.stringify(part));
            }
            return;
        }
        var name = m[1];
        var p = +m[3] / 100;
        var item = {
            name: name,
            p: p,
            rarity: currentRarity,
            kind: currentKind
        };
        var character = charactersByWeaponName[name];
        if (character) {
            item.character = character;
            item.element = character.element; // FIXME not always the same
            item.race = character.race;
        } else {
            item.element = drawItemElements[name];
            if (item.kind === 'Summon') {
                item.race = 'summon';
            }
        }
        ratesByName[name] = item;
        rates.push(item);
    });
    removeAllChildren(addQueryElement);
    var selects = characterProperties.map(function(property) {
        var propSet = propertySets[property];
        var select = document.createElement("select");
        select.name = "add-query" + idify(property);
        function addOption(text, value) {
            var option = document.createElement("option");
            option.value = value || text;
            option.innerText = text;
            select.appendChild(option);
        }
        var anyName = property === "race" ? "Kind" : ucfirst(property);
        addOption("Any " + anyName, "any");
        if (property === "race") {
            addOption("Any Summon", "summon");
            addOption("Any Character", "character");
        }
        var values = Object.keys(propSet);
        values.sort();
        values.forEach(function(v) { addOption(v) });
        addQueryElement.appendChild(select);
        return {
            property: property,
            element: select,
        };
    });
    var addQueryButton = document.createElement("button");
    addQueryButton.innerText = "Add";
    addQueryButton.onclick = function(e) {
        e.preventDefault();
        var query = {};
        selects.forEach(function(x) {
            query[x.property] = x.element.value;
        });
        queries.push(query);
        updatePlotFromInputs();
    };
    addQueryElement.appendChild(addQueryButton);
}

function currentState() {
    var n = Math.max(1, Math.min(3000, +maxDrawsInput.value));
    var min = Math.max(1, minimumInput.value);
    return {
        n: n,
        m: min,
        w: wishlistInput.value,
        e: excludeListInput.value,
        o: chartDistributionModeSelectElement.value,
        q: queries
    };
}

function loadState(st) {
    maxDrawsInput.value = st.n;
    minimumInput.value = st.m;
    wishlistInput.value = st.w;
    excludeListInput.value = st.e || "";
    chartDistributionModeSelectElement.value = st.o || "gte";
    queries = st.q || [];
    if (st.g !== undefined) {
        Object.keys(st.g).forEach(function(g) {
            var parts = splitGroup(g);
            var kind = parts[1];
            var race = kind === "Weapon" ? "character" : "summon";
            var q = { rarity: parts[0], element: "any", race: race };
            queries.push(q);
        });
    }
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

function ratesForNames(names) {
    return names.map(function(name) {
        var rate = ratesByName[name];
        if (rate !== undefined) {
            return rate;
        } else {
            return ratesByName[charactersByName[name].join_weapon];
        }
    }).filter(function(item) {
        return item !== undefined;
    });
}

function namesOf(items) {
    return items.map(function(item) { return item.name; });
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

function matchesQuery(query, item) {
    function anyMatch(queryValue, value) {
        return queryValue === "any" || value === queryValue;
    }
    if (!anyMatch(query.rarity, item.rarity)) return false;
    if (!anyMatch(query.element, item.element)) return false;
    if (query.race === "character") {
        if (!item.character) return false;
    } else if (!anyMatch(query.race, item.race)) {
        return false;
    }
    return true;
}

function matchesAnyQuery(queries, item) {
    return queries.some(function(q) { return matchesQuery(q, item); });
}

function updatePlotFromInputs(ev) {
    var st = currentState();
    var n = st.n;
    var min = st.m;
    var names = st.w.split("\n");
    var excludes = st.e.split("\n");
    var qs = st.q;
    var correctedNames = autocorrectNames(names);
    var correctedRates = ratesForNames(correctedNames);
    var correctedNameSet = makeSet(namesOf(correctedRates));
    var correctedExcludes = autocorrectNames(excludes);
    var correctedExcludeSet = makeSet(namesOf(ratesForNames(correctedExcludes)));

    var matchingItems = rates.filter(function(item) {
        return correctedNameSet[item.name] !== true && matchesAnyQuery(qs, item);
    });

    var allItems = correctedRates.concat(matchingItems).filter(function(item) {
        return correctedExcludeSet[item.name] !== true;
    });

    var probs = allItems.map(function(item) { return item.p; });
    var probSum = probs.reduce(function(x, y){ return x + y; }, 0);
    plotCumulative(min, n, probSum);
    plotDistribution(min, Math.min(selectedDistributionDrawCount, n), probSum);

    if (ev !== "keyup") {
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

        if (queriesElement.children.length !== qs.length) {
            removeAllChildren(queriesElement);
            qs.forEach(function(q, i) {
                var props = characterProperties.map(function(p) { return q[p]; }).
                    filter(function(v) { return v !== 'any'; });

                var matches = rates.filter(function(item) { return matchesQuery(q, item); });
                var matchNames = matches.map(function(item) {
                    if (item.character !== undefined) {
                        return item.character.name + " (" + item.name + ")";
                    } else {
                        return item.name;
                    }
                });
                matchNames.sort();
                var matchCount = matches.length;

                var text = "Any " + props.join(" ");
                if (props.length === 0) {
                    text += "Weapon or Summon";
                }
                text += " (" + matchCount + ")";

                var li = document.createElement("li");
                var span = document.createElement("span");
                span.innerText = text;
                span.title = matchNames.join("\n");
                li.appendChild(span);
                li.appendChild(document.createTextNode(" "));
                var removeButton = document.createElement("a");
                removeButton.href = "#";
                removeButton.innerText = "x";
                removeButton.addEventListener("click", function(e) {
                    e.preventDefault();
                    queries.splice(i, 1);
                    updatePlotFromInputs();
                });
                li.appendChild(removeButton);
                queriesElement.appendChild(li);
            });
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
    var onFastOptionUpdate = function() { updatePlotFromInputs(ev) };
    var onOptionUpdate = debounce(onFastOptionUpdate, debounceDelay);
    var onDataUpdate = debounce(function() { updateRates(); updatePlotFromInputs(ev) }, debounceDelay);
    [maxDrawsInput, wishlistInput, excludeListInput].forEach(function(input) {
        input.addEventListener(ev, onOptionUpdate);
    });
    [minimumInput, chartDistributionModeSelectElement].forEach(function(input) {
        input.addEventListener(ev, onFastOptionUpdate);
    });
    drawDataInput.addEventListener(ev, onDataUpdate);
});
window.addEventListener("popstate", function(e) {
    if (loadStateFromHash()) {
        updatePlotFromInputs();
    }
});

var charactersResponse, elementsResponse;
function try_start() {
    if (!charactersResponse || !elementsResponse) return;
    updateCharacters(charactersResponse.characters);
    updateDrawItemElements(elementsResponse);
    updateRates();
    loadStateFromHash();
    updatePlotFromInputs();
}

function get_json(url, done) {
    var req = new XMLHttpRequest();
    req.addEventListener("load", function() {
        done(JSON.parse(this.responseText));
    });
    req.open("GET", url);
    req.setRequestHeader("Accept", "application/json");
    req.send();
}

get_json("characters.json", function(r) {
    charactersResponse = r;
    try_start();
});
get_json("elements.json", function(r) {
    elementsResponse = r;
    try_start();
});
