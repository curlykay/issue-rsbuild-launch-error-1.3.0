import path from 'path';
import { defineConfig } from '@rsbuild/core';
import { pluginBabel } from '@rsbuild/plugin-babel';
import { pluginVue2 } from '@rsbuild/plugin-vue2';
import { pluginVue2Jsx } from '@rsbuild/plugin-vue2-jsx';
import { pluginSass } from '@rsbuild/plugin-sass';
import { pluginNodePolyfill } from '@rsbuild/plugin-node-polyfill';
import VueDefineOptions from 'unplugin-vue-define-options/rspack';

export default defineConfig((config) => {
  const { envMode } = config;

  const isDev = process.env.NODE_ENV === 'development';
  const isProd = process.env.NODE_ENV === 'production';

  const BASE_URL = '';

  /** SVG Sprite 资源目录 */
  const svgSpriteDir = path.resolve(__dirname, './src/icons/svg/');

  const svgTestRegExp = /\.svg$/i;

  const pkgName = process.env.VUE_APP_PKG_NAME || process.env.npm_package_name!;

  const distPath = path.join('dist', envMode!, pkgName);
  return {
    plugins: [
      pluginBabel({
        include: /\.(?:jsx|tsx)$/,
      }),
      pluginVue2({
        vueLoaderOptions: {
          experimentalInlineMatchResource: false,
        },
      }),
      pluginVue2Jsx(),
      pluginSass({
        sassLoaderOptions: {
          sassOptions: {
            // 关闭 @import 和全局内置函数的弃用警告 https://sass-lang.com/documentation/breaking-changes/import/#silencing-specific-deprecations
            silenceDeprecations: [
              'import',
              'global-builtin',
              'slash-div',
              'function-units',
              'color-functions',
            ],
          },
          additionalData: (content, loaderContext) => {
            const { resourcePath } = loaderContext;
            if (resourcePath.endsWith('.sass')) {
              return content as string;
            }
            return `@use "~@/styles/variables.scss" as *;` + content;
          },
        },
      }),
      pluginNodePolyfill(),
    ],
    dev: {
      /** 将资源路径解析为相对路径 */
      assetPrefix: 'auto',
    },

    output: {
      /**
     解析资源路径为相对路径，以支持产物包能够使用 file 协议打开。
     使用 "./" 会导致 CSS URL 打包后地址错误的问题
     */
      assetPrefix: 'auto',
      // 仅在生产模式清理 dist 目录
      cleanDistPath: isProd,
      // 自动填充 JS polyfill
      polyfill: 'entry',
      // 打包后不生成 license 文件
      legalComments: 'none',
      // 配置输出文件地址，请根据实际情况修改
      distPath: {
        root: distPath,
      },
    },
    resolve: {
      // 设置别名
      alias: {
        '@': path.resolve(__dirname, './src'),
      },
    },
    source: {
      // 指定入口文件
      entry: {
        index: './src/main.ts',
      },

      define: {},
      // 使用旧版装饰器规范转义装饰器，兼容 Vue 类组件
      decorators: {
        version: 'legacy',
      },
    },
    html: {
      // 指定模板文件
      template: './public/index.html',
      // 指定网页图标文件
      favicon: path.resolve(__dirname, './src/assets/favicon.ico'),
      // 设置项目默认标题
      title: process.env.VUE_APP_APP_NAME,
      // 配合 inject: 'body' 注入 script 标签至 body 中
      scriptLoading: 'blocking',
      inject: 'body',
      // 注入模板变量
      templateParameters: {
        // 根据 assetPrefix 配置改动
        BASE_URL,
        // HTML 模板需要的额外变量
      },
    },
    tools: {
      // 配置 Rspack，Rspack 兼容 Webpack 的配置结构和生态
      rspack: (rspackConfig, { appendPlugins, addRules, mergeConfig }) => {
        // 从配置中获取 SVG 模块的规则
        const rule: any = rspackConfig?.module?.rules?.find((rule) => {
          if (!rule) {
            return;
          }
          if (typeof rule !== 'object') {
            return;
          }
          if (!(rule.test instanceof RegExp)) {
            return;
          }
          // 检查规则的测试是否与 SVG 正则表达式匹配
          return (
            rule.test.source === svgTestRegExp.source &&
            rule.test.flags === svgTestRegExp.flags
          );
        });

        // 如果找到了规则，则将其排除列表初始化
        if (rule) {
          rule.exclude = rule.exclude || [];
          // 将需要被 svg-sprite-loader 处理的目录添加到排除列表中
          rule.exclude.push(svgSpriteDir);
        }

        /** 添加 SVG Sprite 方案配置。
         *  注：SVG Sprite 方案在 Rsbuild 中不支持提取(extract)模式
         */
        addRules([
          {
            test: svgTestRegExp,
            include: svgSpriteDir,
            use: [
              {
                loader: 'svg-sprite-loader',
                options: {
                  symbolId: 'icon-[name]',
                },
              },
            ],
          },
        ]);

        appendPlugins([VueDefineOptions()]);

        mergeConfig(rspackConfig, {
          experiments: {
            // 开发模式下 启用 Rspack 提供的增量构建模式
            incremental: isDev,
          },
        });
      },
    },
  };
});
