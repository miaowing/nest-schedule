import * as CoreModule from '@nestcloud/core';
import { Module } from '@nestjs/core/injector/module';
import { InstanceWrapper } from '@nestjs/core/injector/instance-wrapper';
import { STATIC_CONTEXT } from '@nestjs/core/injector/constants';

export function chooseModule(metatype: Function) {
  let NestCloud;
  try {
    const Core: typeof CoreModule = require('@nestcloud/core');
    NestCloud = Core.NestCloud;
  } catch (e) {
    return null;
  }

  const container = NestCloud.global.getContainer();
  if (container) {
    const modules: Map<string, Module> = container.getModules();
    for (const module of modules.values()) {
      const instanceWrapper = module.injectables.get(metatype.name);
      if (
        instanceWrapper &&
        module.injectables.has(metatype.name) &&
        instanceWrapper.metatype === metatype
      ) {
        return module;
      }
    }
  }

  return void 0;
}

export function getInstance(module: Module, metatype: Function) {
  const instanceWrapper: InstanceWrapper = module.injectables.get(
    metatype.name,
  );
  if (instanceWrapper) {
    const instanceHost = instanceWrapper.getInstanceByContextId(STATIC_CONTEXT);
    if (instanceHost.isResolved && instanceHost.instance) {
      return instanceHost.instance;
    }
  }
}
