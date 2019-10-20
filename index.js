// License: Boost Software License 1.0
// See https://www.boost.org/LICENSE_1_0.txt
// Copyright © 2019 yumetodo <yume-wikijp@live.jp>

//@ts-check
(function() {
  const json = `{
    "total": {
      "easy" : [
        {
          "id": "u1033782",
          "name": "高見Ｐ",
          "score": 866630
        }
      ],
      "extreme" : [
        {
          "id": "u8427969",
          "name": "夏侯勇さん",
          "score": 2354350
        },
        {
          "id" : "u7449309",
          "name" : "vermilion教官",
          "score" : 2072966
        },
        {
          "id": "u7089477",
          "name": "けいたん。",
          "score": 1907716,
          "unit": "https://tokidolranking.site/unitpic/dreaming_u7089477.png"
        },
        {
          "id": "u4475211",
          "name": "ポケテンＰ",
          "score": 1600554
        },
        {
          "id": "a0000001",
          "name": "神御田プロデューサー",
          "score": 1468422,
          "icon": "https://tokidolranking.site/icon/a0000001.png",
          "unit": "https://tokidolranking.site/unitpic/dreaming_a0000001.png"
        }
      ]
    },
    "cmonth": {
      "easy" : [
        {
          "id": "u1033782",
          "name": "高見Ｐ",
          "score": 866630
        }
      ]
    },
    "bmonth": {
      "easy" : [
        {
          "id": "u1033782",
          "name": "高見Ｐ",
          "score": 866630,
          "icon": "https://tokidolranking.site/icon/a0000001.png",
          "unit": "https://tokidolranking.site/unitpic/dreaming_a0000001.png"
        }
      ]
    }
  }`;
  /**
   * @param {EventListenerOrEventListenerObject} loaded
   */
  function ready(loaded) {
    if (['interactive', 'complete'].includes(document.readyState)) {
      loaded();
    } else {
      document.addEventListener('DOMContentLoaded', loaded);
    }
  }
  const rankMappper = Object.freeze(['./1位.png', './2位.png', './3位.png']);
  const input = JSON.parse(json);
  const rankingTypeList = Object.freeze(Object.keys(input));
  /**
   * @returns {Readonly<Map<string, string>>}
   */
  const createRankingTypeDescriptionMap = () => {
    const map = new Map();
    map.set('total', '総合');
    map.set('cmonth', '月間(今月)');
    map.set('bmonth', '月間(先月)');
    return Object.freeze(map);
  };
  const rankingTypeDescriptionMap = createRankingTypeDescriptionMap();
  /**
   * @returns {readonly string[]}
   */
  const createGameModeList = list => {
    /** @types {string[]} */
    const re = [];
    for (const gameMode in list) {
      if (Object.prototype.hasOwnProperty.call(list, gameMode)) {
        re.push(gameMode);
      }
    }
    return Object.freeze(re);
  };
  /**
   * @param {readonly string[]} list target list
   * @param {string|null|undefined} value
   * @param {string} fallbackValue
   */
  const decideDefault = (list, value, fallbackValue) => {
    return value && list.findIndex(v => v === value)
      ? value
      : list.findIndex(v => v === fallbackValue)
      ? fallbackValue
      : list[list.length - 1];
  };
  const routeLinkClickEvent = new Event('routeLinkClick');
  class NavBase extends EventTarget {
    /**
     * @param {readonly string[]} list target list
     * @param {string} selectedValue
     * @param {string} cssClassPrefix
     * @param {(v: string) => string} valueConverter
     */
    constructor(list, selectedValue, cssClassPrefix, valueConverter) {
      super();
      this.list_ = list;
      this.current_ = selectedValue;
      this.cssClassPrefix_ = cssClassPrefix;
      this.valueConverter_ = valueConverter;
    }
    hrefPrefix_() {
      return '';
    }
    view() {
      return m(
        'nav',
        { class: this.cssClassPrefix_ },
        m(
          'div',
          { class: `${this.cssClassPrefix_}-container` },
          this.list_.map(v =>
            m(
              'button',
              {
                class:
                  this.current_ === v
                    ? `${this.cssClassPrefix_}-container__item is-current`
                    : `${this.cssClassPrefix_}-container__item`,
              },
              m(
                m.route.Link,
                {
                  href: `${this.hrefPrefix_()}/${v}`,
                  onclick: () => {
                    this.current_ = v;
                    this.dispatchEvent(routeLinkClickEvent);
                  },
                },
                this.valueConverter_(v)
              )
            )
          )
        )
      );
    }
    /**
     * @returns {string}
     */
    get current() {
      return this.current_;
    }
    set current(selected) {
      this.current_ = selected;
      this.dispatchEvent(routeLinkClickEvent);
    }
  }
  class RankingType extends NavBase {
    /**
     * @param {string} rankingType
     */
    constructor(rankingType) {
      super(
        rankingTypeList,
        decideDefault(rankingTypeList, rankingType, 'total'),
        'ranking-type',
        v => `${rankingTypeDescriptionMap.get(v)}ランキング`
      );
    }
  }
  class GameMode extends NavBase {
    /**
     * @param {string} rankingType
     * @param {string} gameMode
     */
    constructor(rankingType, gameMode) {
      const list = createGameModeList(input[rankingType]);
      super(list, decideDefault(list, gameMode, 'extreme'), 'game-mode', v => v.charAt(0).toUpperCase() + v.slice(1));
      this.prefix_ = rankingType;
    }
    hrefPrefix_() {
      return `/${this.prefix_}`;
    }
  }
  /**
   *
   * @param {any} info
   * @param {number} rank
   */
  const createRankingCard = (info, rank) => {
    const cssClassPrefix = 'ranking-card';
    const userInfo = [];
    /**
     * @param {string} prop
     */
    const pushToUserInfoIfExist = prop => {
      if (Object.prototype.hasOwnProperty.call(info, prop)) {
        userInfo.push(m('span', { class: `${cssClassPrefix}__user-${prop}` }, info[prop]));
      }
    };
    pushToUserInfoIfExist('name');
    pushToUserInfoIfExist('id');
    const contents = [];
    if (0 !== userInfo.length) {
      contents.push(m('div', { class: `${cssClassPrefix}__user-info` }, userInfo));
    }
    if (Object.prototype.hasOwnProperty.call(info, 'score')) {
      contents.push(m('dl', [m('dt', 'score'), m('dd', info['score'])]));
    }
    if (Object.prototype.hasOwnProperty.call(info, 'unit')) {
      contents.push(m('img', { src: info['unit'], alt: 'score' }));
    }
    return m('article', { class: cssClassPrefix }, [
      m('div', { class: `${cssClassPrefix}__icons` }, [
        Object.prototype.hasOwnProperty.call(info, 'icon')
          ? m('img', { src: info['icon'], alt: 'user icon' })
          : m('div', { class: `${cssClassPrefix}__no-user-icon` }, [
              m('i', { class: 'far fa-image' }),
              m('span', 'NO IMAGE'),
            ]),
        rank < rankMappper.length
          ? m('img', { src: rankMappper[rank], alt: `${rank + 1}位` })
          : m('div', { class: `${cssClassPrefix}__rank` }, `${rank + 1}位`),
      ]),
      m('div', { class: `${cssClassPrefix}__contents` }, contents),
    ]);
  };
  /**
   * @param {string} rankingType
   * @param {string} gameMode
   */
  const createRanking = (rankingType, gameMode) => {
    if (!Object.prototype.hasOwnProperty.call(input, rankingType)) {
      return m('section', { class: 'ranking' }, [m('h2', 'Error'), m('p', `${rankingType} is not found in record`)]);
    }
    if (!Object.prototype.hasOwnProperty.call(input[rankingType], gameMode)) {
      return m('section', { class: 'ranking' }, [m('h2', 'Error'), m('p', `${gameMode} is not found in record`)]);
    }
    return m('section', { class: 'ranking' }, input[rankingType][gameMode].map(createRankingCard));
  };
  class Main {
    constructor() {
      this.rankingType = new RankingType();
      this.rankingType.addEventListener('routeLinkClick', () => {
        this.gameMode = new GameMode(this.rankingType.current);
      });
      this.gameMode = new GameMode(this.rankingType.current);
    }
    view(vnode) {
      if (
        Object.prototype.hasOwnProperty.call(vnode.attrs, 'rankingType') &&
        vnode.attrs['rankingType'] !== this.rankingType.current
      ) {
        this.rankingType.current = vnode.attrs['rankingType'];
      }
      if (
        Object.prototype.hasOwnProperty.call(vnode.attrs, 'gameMode') &&
        vnode.attrs['gameMode'] !== this.gameMode.current
      ) {
        this.gameMode.current = vnode.attrs['gameMode'];
      }
      return [m(this.rankingType), m(this.gameMode), createRanking(this.rankingType.current, this.gameMode.current)];
    }
  }
  ready(() => {
    m.route(document.getElementById('mithril'), '/total/extreme', {
      '/:rankingType/:gameMode': new Main(),
    });
  });
})();
