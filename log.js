import { hostname } from "node:os"
import { inspect } from "node:util"

const log = function() {
    /** 
     * @param {'info' | 'error'} level
     * @param {unknown} msg
     * @returns {string}
     */

    const formatMsg = (level, msg) => {        
        return `{"level": "${level}", "hostname": "${hostname}", "message": ${msg}`
    }

    return {
    /** 
     * @param {string} msg
     */
    info: (msg) => {
      console.log(formatMsg('info', msg))
    }, 
    /** 
     * @param {string} msg
     */
    error: (msg) => {
        console.error(formatMsg('error', msg))
      }
    }
  }()

export default log