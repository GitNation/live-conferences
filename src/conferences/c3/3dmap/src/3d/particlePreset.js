export const particlePreset = {
  'preParticles': 50,
  'integrationType': 'EULER',
  'emitters': [
    {
      'id': '51ca9450-3d8b-11e9-a1e8-4785d9606b75',
      'totalEmitTimes': null,
      'life': null,
      'cache': {'totalEmitTimes': null, 'life': null},
      'rate': {
        'particlesMin': 1,
        'particlesMax': 4,
        'perSecondMin': 0.001,
        'perSecondMax': 0.002
      },
      'scale': 0.1,
      'position': {'x': -1, 'y': -60, 'z': -50},
      'initializers': [
        {
          'id': '51ca9451-3d8b-11e9-a1e8-4785d9606b75',
          'type': 'Mass',
          'properties': {'min': 5, 'max': 10, 'isEnabled': true}
        },
        {
          'id': '51ca9452-3d8b-11e9-a1e8-4785d9606b75',
          'type': 'Life',
          'properties': {'min': 7, 'max': 15, 'isEnabled': true}
        },
        {
          'id': '51ca9453-3d8b-11e9-a1e8-4785d9606b75',
          'type': 'BodySprite',
          'properties': {
            'texture': 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAACAAAAAgCAYAAABzenr0AAAABGdBTUEAAK/INwWK6QAAABl0RVh0U29mdHdhcmUAQWRvYmUgSW1hZ2VSZWFkeXHJZTwAAAJkSURBVHjaxJeJbusgEEW94S1L//83X18M2MSuLd2pbqc4wZGqRLrKBsyZhQHny7Jk73xVL8xpVhWrcmiB5lX+6GJ5YgQ2owbAm8oIwH1VgKZUmGcRqKGGPgtEQQAzGR8hQ59fAmhJHSAagigJ4E7GPWRXOYC6owAd1JM6wDQPADyMWUqZRMqmAojHp1Vn6EQQEgUNMJLnUjMyJsM49wygBkAPw9dVFwXRkncCIIW3GRgoTQUZn6HxCMAFEFd8TwEQ78X4rHbILoAUmeT+RFG4UhQ6MiIAE4W/UsYFjuVjAIa2nIY4q1R0GFtQWG3E84lqw2GO2QOoCKBVu0BAPgDSU0eUDjjQenNkV/AW/pWChhpMTelo1a64AOKM30vk18GzTHXCNtI/Knz3DFBgsUqBGIjTInXRY1yA9xkVoqW5tVq3pDR9A0hfF5BSARmVnh7RMDCaIdcNgbPBkgzn1Bu+SfIEFSpSBmkxyrMicb0fAEuCZrWnN89veA/4XcakrPcjBWzkTuLjlbfTQPOlBhz+HwkqqPXmPQDdrQItxE1moGof1S74j/8txk8EHhTQrAE8qlwfqS5yukm1x/rAJ9Jiaa6nyATqD78aUVBhFo8b1V4DdTXdCW+IxA1zB4JhiOhZMEWO1HqnvdoHZ4FAMIhV9REF8FiUm0jsYPEJx/Fm/N8OhH90HI9YRHesWbXXZwAShU8qThe7H8YAuJmw5yOd989uRINKRTJAhoF8jbqrHKfeCYdIISZfSq26bk/K+yO3YvfKrVgiwQBHnwt8ynPB25+M8hceTt/ybPhnryJ78+tLgAEAuCFyiQgQB30AAAAASUVORK5CYII=',
            'isEnabled': true
          }
        },
      ],
      'behaviours': [
        {
          'id': '51ca9459-3d8b-11e9-a1e8-4785d9606b75',
          'type': 'Force',
          'properties': {
            'fx': -0.001,
            'fy': 0,
            'fz': 0,
            'life': 10,
            'easing': 'easeLinear',
            isEnabled: true
          }
        },
        {
          'id': '51ca9456-3d8b-11e9-a1e8-4785d9606b75',
          'type': 'Alpha',
          'properties': {
            'alphaA': 0.05,
            'alphaB': 0,
            'life': null,
            'easing': 'easeLinear'
          }
        },
        {
          'id': '51ca9457-3d8b-11e9-a1e8-4785d9606b75',
          'type': 'Color',
          'properties': {
            'colorA': '#00bdff',
            'colorB': '#7AA4B6',
            'life': null,
            'easing': 'easeOutCubic'
          }
        },
        {
          'id': '51ca9458-3d8b-11e9-a1e8-4785d9606b75',
          'type': 'Scale',
          'properties': {
            'scaleA': 0.001,
            'scaleB': 0.12,
            'life': null,
            'easing': 'easeLinear'
          }
        }
      ],
      'emitterBehaviours': []
    }
  ]
};
