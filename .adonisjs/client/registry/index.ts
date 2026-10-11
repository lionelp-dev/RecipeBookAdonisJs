/* eslint-disable prettier/prettier */
import type { AdonisEndpoint } from '@tuyau/core/types'
import type { Registry } from './schema.d.ts'
import type { ApiDefinition } from './tree.d.ts'

const placeholder: any = {}

const routes = {
  'drive.fs.serve': {
    methods: ["GET","HEAD"],
    pattern: '/uploads/*',
    tokens: [{"old":"/uploads/*","type":0,"val":"uploads","end":""},{"old":"/uploads/*","type":2,"val":"*","end":""}],
    types: placeholder as Registry['drive.fs.serve']['types'],
  },
  'home': {
    methods: ["GET","HEAD"],
    pattern: '/',
    tokens: [{"old":"/","type":0,"val":"/","end":""}],
    types: placeholder as Registry['home']['types'],
  },
  'recipes.create': {
    methods: ["GET","HEAD"],
    pattern: '/recipes/new',
    tokens: [{"old":"/recipes/new","type":0,"val":"recipes","end":""},{"old":"/recipes/new","type":0,"val":"new","end":""}],
    types: placeholder as Registry['recipes.create']['types'],
  },
  'recipes.store': {
    methods: ["POST"],
    pattern: '/recipes',
    tokens: [{"old":"/recipes","type":0,"val":"recipes","end":""}],
    types: placeholder as Registry['recipes.store']['types'],
  },
  'recipes.generate': {
    methods: ["POST"],
    pattern: '/recipes/generate',
    tokens: [{"old":"/recipes/generate","type":0,"val":"recipes","end":""},{"old":"/recipes/generate","type":0,"val":"generate","end":""}],
    types: placeholder as Registry['recipes.generate']['types'],
  },
  'recipe_discovery.pool': {
    methods: ["POST"],
    pattern: '/recipes/discover/pool',
    tokens: [{"old":"/recipes/discover/pool","type":0,"val":"recipes","end":""},{"old":"/recipes/discover/pool","type":0,"val":"discover","end":""},{"old":"/recipes/discover/pool","type":0,"val":"pool","end":""}],
    types: placeholder as Registry['recipe_discovery.pool']['types'],
  },
  'recipe_discovery.save': {
    methods: ["POST"],
    pattern: '/recipes/discover/save',
    tokens: [{"old":"/recipes/discover/save","type":0,"val":"recipes","end":""},{"old":"/recipes/discover/save","type":0,"val":"discover","end":""},{"old":"/recipes/discover/save","type":0,"val":"save","end":""}],
    types: placeholder as Registry['recipe_discovery.save']['types'],
  },
  'recipes.edit': {
    methods: ["GET","HEAD"],
    pattern: '/recipes/:id/edit',
    tokens: [{"old":"/recipes/:id/edit","type":0,"val":"recipes","end":""},{"old":"/recipes/:id/edit","type":1,"val":"id","end":""},{"old":"/recipes/:id/edit","type":0,"val":"edit","end":""}],
    types: placeholder as Registry['recipes.edit']['types'],
  },
  'recipes.update': {
    methods: ["PATCH"],
    pattern: '/recipes/:id',
    tokens: [{"old":"/recipes/:id","type":0,"val":"recipes","end":""},{"old":"/recipes/:id","type":1,"val":"id","end":""}],
    types: placeholder as Registry['recipes.update']['types'],
  },
  'recipes.destroy': {
    methods: ["DELETE"],
    pattern: '/recipes/:id',
    tokens: [{"old":"/recipes/:id","type":0,"val":"recipes","end":""},{"old":"/recipes/:id","type":1,"val":"id","end":""}],
    types: placeholder as Registry['recipes.destroy']['types'],
  },
  'new_account.create': {
    methods: ["GET","HEAD"],
    pattern: '/signup',
    tokens: [{"old":"/signup","type":0,"val":"signup","end":""}],
    types: placeholder as Registry['new_account.create']['types'],
  },
  'new_account.store': {
    methods: ["POST"],
    pattern: '/signup',
    tokens: [{"old":"/signup","type":0,"val":"signup","end":""}],
    types: placeholder as Registry['new_account.store']['types'],
  },
  'session.create': {
    methods: ["GET","HEAD"],
    pattern: '/login',
    tokens: [{"old":"/login","type":0,"val":"login","end":""}],
    types: placeholder as Registry['session.create']['types'],
  },
  'session.store': {
    methods: ["POST"],
    pattern: '/login',
    tokens: [{"old":"/login","type":0,"val":"login","end":""}],
    types: placeholder as Registry['session.store']['types'],
  },
  'session.destroy': {
    methods: ["POST"],
    pattern: '/logout',
    tokens: [{"old":"/logout","type":0,"val":"logout","end":""}],
    types: placeholder as Registry['session.destroy']['types'],
  },
} as const satisfies Record<string, AdonisEndpoint>

export { routes }

export const registry = {
  routes,
  $tree: {} as ApiDefinition,
}

declare module '@tuyau/core/types' {
  export interface UserRegistry {
    routes: typeof routes
    $tree: ApiDefinition
  }
}
