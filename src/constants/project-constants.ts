export const BASE_URL = 'http://localhost:3000'
export const SITE_URL = 'grupow.net'
export const VERSION = '0.0.1'
export const PHONE_CONTACT = '(62) 9 9999-9999'

/**
 * @var default: Centro Geográfico de Goiânia
 */
export const AGM = {
  searchUrl: 'https://maps.googleapis.com/maps/api/geocode/json?address=',
  apiKey: 'AIzaSyAbSNctv1j8nBETR25EILcUYA2c-jnkdb0',
  libs: [
    'places',
  ],
  default: {
    coords: {
      lat: -16.6868824,
      lng: -49.26478849999999,
    },
    zoom: {
      unfocused: 13,
      focused: 15,
    },
  },
  styles: [
    {
      "elementType": "geometry",
      "stylers": [
        {
          "color": "#f5f5f5"
        }
      ]
    },
    {
      "elementType": "labels.icon",
      "stylers": [
        {
          "visibility": "off"
        }
      ]
    },
    {
      "elementType": "labels.text.fill",
      "stylers": [
        {
          "color": "#616161"
        }
      ]
    },
    {
      "elementType": "labels.text.stroke",
      "stylers": [
        {
          "color": "#f5f5f5"
        }
      ]
    },
    {
      "featureType": "administrative.land_parcel",
      "elementType": "labels.text.fill",
      "stylers": [
        {
          "color": "#bdbdbd"
        }
      ]
    },
    {
      "featureType": "landscape.man_made",
      "elementType": "geometry.fill",
      "stylers": [
        {
          "color": "#cccccc"
        },
        {
          "visibility": "off"
        }
      ]
    },
    {
      "featureType": "landscape.natural",
      "elementType": "geometry.fill",
      "stylers": [
        {
          "color": "#f0f0f0"
        },
        {
          "visibility": "on"
        }
      ]
    },
    {
      "featureType": "landscape.natural.landcover",
      "elementType": "geometry.fill",
      "stylers": [
        {
          "color": "#d2f1c4"
        },
        {
          "visibility": "on"
        }
      ]
    },
    {
      "featureType": "poi",
      "elementType": "geometry",
      "stylers": [
        {
          "color": "#eeeeee"
        }
      ]
    },
    {
      "featureType": "poi",
      "elementType": "labels.text.fill",
      "stylers": [
        {
          "color": "#757575"
        }
      ]
    },
    {
      "featureType": "poi.park",
      "elementType": "geometry",
      "stylers": [
        {
          "color": "#e5e5e5"
        }
      ]
    },
    {
      "featureType": "poi.park",
      "elementType": "geometry.fill",
      "stylers": [
        {
          "color": "#c2fcb5"
        },
        {
          "visibility": "on"
        }
      ]
    },
    {
      "featureType": "poi.park",
      "elementType": "labels.text.fill",
      "stylers": [
        {
          "color": "#9e9e9e"
        }
      ]
    },
    {
      "featureType": "road",
      "elementType": "geometry",
      "stylers": [
        {
          "color": "#ffffff"
        }
      ]
    },
    {
      "featureType": "road.arterial",
      "elementType": "geometry.fill",
      "stylers": [
        {
          "color": "#ffddc9"
        },
        {
          "visibility": "on"
        }
      ]
    },
    {
      "featureType": "road.arterial",
      "elementType": "geometry.stroke",
      "stylers": [
        {
          "color": "#ffffff"
        },
        {
          "weight": 2.5
        }
      ]
    },
    {
      "featureType": "road.arterial",
      "elementType": "labels.text.fill",
      "stylers": [
        {
          "color": "#757575"
        }
      ]
    },
    {
      "featureType": "road.highway",
      "elementType": "geometry",
      "stylers": [
        {
          "color": "#dadada"
        }
      ]
    },
    {
      "featureType": "road.highway",
      "elementType": "geometry.fill",
      "stylers": [
        {
          "color": "#ffff9c"
        },
        {
          "visibility": "on"
        }
      ]
    },
    {
      "featureType": "road.highway",
      "elementType": "geometry.stroke",
      "stylers": [
        {
          "color": "#ff8743"
        },
        {
          "visibility": "on"
        }
      ]
    },
    {
      "featureType": "road.highway",
      "elementType": "labels.text.fill",
      "stylers": [
        {
          "color": "#616161"
        }
      ]
    },
    {
      "featureType": "road.local",
      "elementType": "geometry.fill",
      "stylers": [
        {
          "weight": 1.5
        }
      ]
    },
    {
      "featureType": "road.local",
      "elementType": "labels.text.fill",
      "stylers": [
        {
          "color": "#9e9e9e"
        }
      ]
    },
    {
      "featureType": "transit.line",
      "elementType": "geometry",
      "stylers": [
        {
          "color": "#e5e5e5"
        }
      ]
    },
    {
      "featureType": "transit.station",
      "elementType": "geometry",
      "stylers": [
        {
          "color": "#eeeeee"
        }
      ]
    },
    {
      "featureType": "water",
      "elementType": "geometry",
      "stylers": [
        {
          "color": "#c9c9c9"
        }
      ]
    },
    {
      "featureType": "water",
      "elementType": "geometry.fill",
      "stylers": [
        {
          "color": "#abd8f1"
        },
        {
          "visibility": "on"
        }
      ]
    },
    {
      "featureType": "water",
      "elementType": "labels.text.fill",
      "stylers": [
        {
          "color": "#9e9e9e"
        }
      ]
    }
  ],
}

export const PATTERNS = {
  stringToRegExp: (pass) => {
    let result = ''
    pass.split('').forEach(char => result += `[${char}]`)
    return new RegExp(`^${result}$`)
  },
  PASSWORD: /^(?=.*\d)(?=.*[a-z])(?=.*[A-Z])[0-9a-zA-Z!@#$%^&*?\.\-\_\\\/]{8,}$/g,
  EMAIL: /^[\w\.-]*[a-zA-Z0-9_]@[\w\.-]*[a-zA-Z0-9]\.[a-zA-Z][a-zA-Z\.]*[a-zA-Z]$/g,
  PHONE: /^[(][0-9]{2}[)]\s[9][0-9]{4}[-][0-9]{4}$/g,
  GENDER: /^([F]|[M]){1}$/g,
  WORD: /^([\w]*[\s])*$/,
};

export const FIREBASE_CREATING_USER_ERROS = {
  'auth/email-already-in-use': 'Já existe uma conta associada a este e-mail. Por favor, tente novamente com outro endereço de e-mail.',
  'auth/invalid-email': 'O e-mail informado é inválido ou contem algum erro de digitação.',
  'auth/operation-not-allowed': 'Este método de cadastro está temporariamente indisponível. Por favor, tente novamente mais tarde.',
  'auth/weak-password': 'A senha digitada não é forte o suficiente. Recomendamos senhas com pelo menos 8 caracteres (letras, números), tendo, no mínimo, 1 letra maiúscula e sem caracteres especiais.'
}

export const FIREBASE_LOGIN_ERROS = {
  'auth/invalid-email': 'Este e-mail é invalido. Por favor, verifique se você digitou corretamente.',
  'auth/user-disabled': 'O usuário associado a este e-mail foi banido da plataforma. Para mais detalhes, entre em contato conosco.',
  'auth/user-not-found': 'Não existe uma conta associada a este email. Se você deseja se associar à cooperativa e já possui um convite, clique no botão "seja um motorista", na parte inferior da tela.',
  'auth/wrong-password': 'E-mail ou senha incorretos. Por favor, verifique os dados informados e tente novamente.'
}

export const StringTools = {
  replaceAll: (target: string, search: string, replacement: string) => {
    return target.replace(new RegExp(search, 'g'), replacement)
  },
  removeDoubleSpaces: (target: string) => {
    return target.replace(/\s\s+/g, ' ')
  },
  b64EncodeUnicode: (target) => {
    return btoa(encodeURIComponent(target).replace(/%([0-9A-F]{2})/g,
      (match, p1) => String.fromCharCode(parseInt(`0x${p1}`))
    ));
  },
  cutString: (target: string, max: number) => {
    if (target.length > max) return (`${target.substring(0, max)}...`)
	  return target
  }
}

export const JSONTools = {
    getCircularReplacer: () => {
    const seen = new WeakSet;
    return (key, value) => {
      if (typeof value === "object" && value !== null) {
        if (seen.has(value)) {
          return;
        }
        seen.add(value);
      }
      return value;
    };
  }
};
