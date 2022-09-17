<template>
  <div id="app">
    <div><pre>{{ formData }}</pre>
        <b-navbar type="dark" variant="dark">
          <div class="container-xl">
            <b-navbar-brand href="#">Assignment App</b-navbar-brand>
            <b-navbar-nav>
              <b-nav-item href="#">Home</b-nav-item>
              <!-- Navbar dropdowns -->
              <b-nav-item-dropdown text="Lang" right>
                <b-dropdown-item href="#">EN</b-dropdown-item>
                <b-dropdown-item href="#">ES</b-dropdown-item>
                <b-dropdown-item href="#">RU</b-dropdown-item>
                <b-dropdown-item href="#">FA</b-dropdown-item>
              </b-nav-item-dropdown>

              <b-nav-item-dropdown text="User" right>
                <b-dropdown-item href="#">Account</b-dropdown-item>
                <b-dropdown-item href="#">Settings</b-dropdown-item>
              </b-nav-item-dropdown>
            </b-navbar-nav>
          </div>
        </b-navbar>
    </div>
    <div class="container-xl mt-4">
      <div>
        <b-card
          header="Comment Importer"
          header-tag="header"
        >
          <div class="table-wrapper">
              <div class="row">
                <div class="col-md-6">
                  <b-input-group class="mt-3">
                    <b-form-file @change="getFile" placeholder="Choose .json file" ref="file-input"></b-form-file>
                    <b-button @click="submitForm()" variant="info" class="ml-3">
                      <b-icon icon="upload"></b-icon> Upload
                    </b-button>
                  </b-input-group>
                  <b-alert v-if="!valid" show variant="danger" class="mt-2">File Is not Valid. <b v-if="errors.id">Invalid ID is  ({{ errors.id }}) </b></b-alert>
                </div>
              </div>
              <div class="table-title mt-4">
                  <div class="row">
                      <div class="col-sm-8"><h2>Comments <b>List</b></h2></div>
                      <div class="col-sm-4">
                          <div class="search-box">
                              <b-icon class="material-icons i" icon="search"></b-icon>
                              <input type="text" class="form-control" placeholder="Search...">
                          </div>
                      </div>
                  </div>
              </div>
            <div class="table-responsive">
              <table class="table table-striped table-hover table-bordered">
                  <thead>
                      <tr>
                          <th>Serial No</th>
                          <th>Username</th>
                          <th>Post</th>
                          <th>Comment</th>
                          <th>Actions</th>
                      </tr>
                  </thead>
                  <tbody>
                      <tr>
                          <td>1</td>
                          <td>Thomas Hardy</td>
                          <td>89 Chiaroscuro Rd.</td>
                          <td>Portland</td>
                          <td>
                              <a href="#" class="edit" title="Edit" data-toggle="tooltip"><b-icon icon="trash">&#xE254;</b-icon></a>
                              <a href="#" class="delete" title="Delete" data-toggle="tooltip"><b-icon icon="pencil-square">&#xE254;</b-icon></a>
                          </td>
                      </tr>
                  </tbody>
              </table>
              <div class="clearfix mt-3">
                  <div class="hint-text">Showing <b>5</b> out of <b>25</b> entries</div>
                  <ul class="pagination">
                      <li class="page-item disabled"><a href="#"><i class="fa fa-angle-double-left"></i></a></li>
                      <li class="page-item"><a href="#" class="page-link">1</a></li>
                      <li class="page-item"><a href="#" class="page-link">2</a></li>
                      <li class="page-item active"><a href="#" class="page-link">3</a></li>
                      <li class="page-item"><a href="#" class="page-link">4</a></li>
                      <li class="page-item"><a href="#" class="page-link">5</a></li>
                      <li class="page-item"><a href="#" class="page-link"><i class="fa fa-angle-double-right"></i></a></li>
                  </ul>
              </div>
            </div>
          </div>
        </b-card>
      </div>
    </div>
  </div>
</template>

<script>
import RestApi, { baseUrl } from './config/api_config'
export default {
  name: 'App',
  components: {
  },
  data () {
    return {
      file: [],
      datas: [],
      valid: true,
      errors: {},
      formData: {
        users: [],
        posts: [],
        comments: []
      }
    }
  },
  methods: {
    getFile (e) {
      if (e.target.files[0] === undefined) {
        this.datas = []
        this.errors = {}
        this.valid = true
      }
      const fileReader = new FileReader()
      fileReader.readAsText(e.target.files[0], "UTF-8")
      fileReader.onload = e => {
        this.datas = JSON.parse(e.target.result)
      }
    },
    checkFormat () {
      if (!this.datas.comments) {
        this.valid = false
        return false
      }
      this.datas.comments.map(item => {
        if (item.id === undefined || item.body === undefined || item.postId === undefined || item.user === undefined || item.user.id === undefined || item.user.username === undefined ) {
          this.valid = false
          this.errors = item
        }
      })
    },
    async submitForm () {
      this.checkFormat()
      let tmpUser = []
      let tmpPost = []
      let tmpComment = []
      this.datas.comments.forEach(comment => {
        // find user push unique user
        const user = tmpUser.find(item => item.id === comment.user.id)
        if (typeof user === 'undefined') {
          tmpUser.push(comment.user)
        }
        // find post push unique user
        const post = tmpPost.find(item => item.id === comment.postId)
        if (typeof post === 'undefined') {
          tmpPost.push({
            id: comment.postId,
            user_id: comment.user.id
          })
        }
        // find comments push unique user
        const commentOne = tmpComment.find(item => item.id === comment.id)
        if (typeof commentOne === 'undefined') {
          tmpComment.push({
            id: comment.id,
            body: comment.body,
            user_id: comment.user.id
          })
        }
      })
      this.formData.users = tmpUser
      this.formData.posts = tmpPost
      this.formData.comments = tmpComment
       const result = await RestApi.postData(baseUrl,'api/v1/comments/store', this.formData)
        if (result.success) {
          console.log(true)
        } else {
          console.log(false)
        }
    }
  }
}
</script>
<style scoped>
  body {
      color: #566787;
      background: #f5f5f5;
      font-family: 'Roboto', sans-serif;
  }
  .table-responsive {
      margin: 30px 0;
  }
  .table-wrapper {
      min-width: 1000px;
      background: #fff;
      padding: 20px;
      padding-top: 3px;
      box-shadow: 0 1px 1px rgba(0,0,0,.05);
  }
  .table-title {
      padding-bottom: 10px;
      margin: 0 0 10px;
      min-width: 100%;
  }
  .table-title h2 {
      margin: 8px 0 0;
      font-size: 22px;
  }
  .search-box {
      position: relative;        
      float: right;
  }
  .search-box input {
      height: 34px;
      border-radius: 20px;
      padding-left: 35px;
      border-color: #ddd;
      box-shadow: none;
  }
  .search-box input:focus {
      border-color: #3FBAE4;
  }
  .search-box .i {
      color: #a0a5b1;
      position: absolute;
      font-size: 19px;
      top: 8px;
      left: 10px;
  }
  table.table tr th, table.table tr td {
      border-color: #e9e9e9;
  }
  table.table-striped tbody tr:nth-of-type(odd) {
      background-color: #fcfcfc;
  }
  table.table-striped.table-hover tbody tr:hover {
      background: #f5f5f5;
  }
  table.table th i {
      font-size: 13px;
      margin: 0 5px;
      cursor: pointer;
  }
  table.table td:last-child {
      width: 130px;
  }
  table.table td a {
      color: #a0a5b1;
      display: inline-block;
      margin: 0 5px;
  }
  table.table td a.view {
      color: #03A9F4;
  }
  table.table td a.edit {
      color: #FFC107;
  }
  table.table td a.delete {
      color: #E34724;
  }
  table.table td i {
      font-size: 19px;
  }    
  .pagination {
      float: right;
      margin: 0 0 5px;
  }
  .pagination li a {
      border: none;
      font-size: 95%;
      width: 30px;
      height: 30px;
      color: #999;
      margin: 0 2px;
      line-height: 30px;
      border-radius: 30px !important;
      text-align: center;
      padding: 0;
  }
  .pagination li a:hover {
      color: #666;
  }	
  .pagination li.active a {
      background: #03A9F4;
  }
  .pagination li.active a:hover {        
      background: #0397d6;
  }
  .pagination li.disabled i {
      color: #ccc;
  }
  .pagination li i {
      font-size: 16px;
      padding-top: 6px
  }
  .hint-text {
      float: left;
      margin-top: 6px;
      font-size: 95%;
  }
</style>
