import { computed, ref, reactive } from 'vue'
import { convertFormat, isNumber, sizeChange, isBoolean } from '../../_utils'
import { useProps } from '../use-props'
import type { CSSProperties, ComputedRef, Ref } from 'vue'
import type { ClassListInterface } from '../../_interface'
import type { UseListReturnInterface, UseListInterface } from './interface'
import type { FilterParamsInterface } from '../use-props/interface'

/**
 * 自动计算组件所需要的类名列表和样式列表
 * 
 * 类名和样式首先通过传入属性列表数组，使用过滤 hook 进行过滤
 * 
 * 过滤后的 prop 对象再进行样式或者类名处理
 *
 * @param prop prop 列表
 * @param name 组件名
 * @returns { UseListReturnInterface }
 */
export const useList: UseListInterface = <T>(
  prop: T,
  name: string
): UseListReturnInterface => {

  /**
   * 过滤 props
   */
  const { filter } = useProps(prop)

  /**
   * 类名列表
   *
   * @param list 类名所需要的 prop 参数
   */
  const classes = (
    list: FilterParamsInterface,
    className?: string
  ): ComputedRef<ClassListInterface> => {
    return computed((): ClassListInterface => {
      /**
       * 类名列表
       */
      const classList: Ref<string[]> = ref<string[]>([])
      /**
       * 过滤得到 prop 集合
       */
      const propList: Record<string, unknown> = filter(list)

      // 是否存在其它需要直接加入的类名
      if (className) {
        classList.value.push(className)
      }

      for (const key in propList) {
        if (propList[key]) {
          /**
           * 如果 prop[key] 是 boolean 类型，则使用键拼接
           *
           * 否则使用值拼接
           */
          classList.value.push(
            `f-${name}__${isBoolean(propList[key]) ? key : propList[key]}`
          )
        }
      }
      return classList.value as unknown as ClassListInterface
    })
  }

  /**
   * 样式列表
   *
   * @param list 样式所需要的 prop 参数
   */
  const styles = (list: FilterParamsInterface): ComputedRef<CSSProperties> => {
    return computed((): CSSProperties => {
      /**
       * 样式列表
       */
      const styleList: Record<string, unknown> = reactive({})
      /**
       * 过滤得到 prop 集合
       */
      const propList: Record<string, unknown> = filter(list)

      for (const key in propList) {
        if (propList[key]) {
          /**
           * @description 为什么要进行 isNumber 判断？
           * 
           * 因为很多属性是同时支持 number 和 staring 类型的参数
           * 
           * 所以这里要进行判断，如果是数字类型，则需要使用 sizeChange 方法进行转换标注单位
           * 
           * @description convertFormat 方法描述
           * 
           * 因为 prop 参数的键都是驼峰命名法，所以这里要转换为短横线连接命名
           */
          styleList[`--f-${name}-${convertFormat(key)}`] = isNumber(propList[key])
            ? sizeChange(propList[key] as number)
            : propList[key]
        }
      }

      return styleList as unknown as CSSProperties
    })
  }

  return {
    classes,
    styles
  } as UseListReturnInterface
}
